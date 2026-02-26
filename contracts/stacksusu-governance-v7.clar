;; StackSusu Governance v8
;; Enhanced Governance System

(define-constant CONTRACT-OWNER tx-sender)

;; =============================
;; Errors
;; =============================

(define-constant ERR-NOT-AUTHORIZED (err u7000))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u7001))
(define-constant ERR-ALREADY-VOTED (err u7002))
(define-constant ERR-VOTING-CLOSED (err u7003))
(define-constant ERR-VOTING-OPEN (err u7004))
(define-constant ERR-THRESHOLD-NOT-MET (err u7005))
(define-constant ERR-NOT-PROPOSER (err u7006))
(define-constant ERR-INVALID-STATUS (err u7007))

;; =============================
;; Status
;; =============================

(define-constant STATUS-ACTIVE u0)
(define-constant STATUS-PASSED u1)
(define-constant STATUS-FAILED u2)
(define-constant STATUS-EXECUTED u3)
(define-constant STATUS-CANCELLED u4)

;; =============================
;; Config (Now Mutable)
;; =============================

(define-data-var voting-period uint u1008)
(define-data-var quorum-threshold uint u10)
(define-data-var pass-threshold uint u51)
(define-data-var proposal-deposit uint u0)

;; =============================
;; State
;; =============================

(define-data-var proposal-counter uint u0)

;; =============================
;; Maps
;; =============================

(define-map proposals
  uint
  {
    proposer: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    votes-for: uint,
    votes-against: uint,
    status: uint,
    created-at: uint,
    ends-at: uint,
    deposit: uint
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  bool
)

;; =============================
;; Governance Config Updates
;; =============================

(define-public (update-config (new-quorum uint) (new-pass uint) (new-period uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set quorum-threshold new-quorum)
    (var-set pass-threshold new-pass)
    (var-set voting-period new-period)
    (ok true)
  )
)

;; =============================
;; Create Proposal
;; =============================

(define-public (create-proposal (title (string-ascii 100)) (description (string-ascii 500)))
  (let
    (
      (proposal-id (+ (var-get proposal-counter) u1))
      (deposit (var-get proposal-deposit))
    )
    ;; Optional anti-spam deposit
    (if (> deposit u0)
        (stx-transfer? deposit tx-sender (as-contract tx-sender))
        (ok true)
    )
    
    (map-set proposals proposal-id {
      proposer: tx-sender,
      title: title,
      description: description,
      votes-for: u0,
      votes-against: u0,
      status: STATUS-ACTIVE,
      created-at: block-height,
      ends-at: (+ block-height (var-get voting-period)),
      deposit: deposit
    })

    (var-set proposal-counter proposal-id)

    (print { event: "proposal-created", id: proposal-id })
    (ok proposal-id)
  )
)

;; =============================
;; Vote (Now Changeable)
;; =============================

(define-public (vote (proposal-id uint) (vote-for bool))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
      (previous-vote (map-get? votes { proposal-id: proposal-id, voter: tx-sender }))
    )
    (asserts! (is-eq (get status proposal) STATUS-ACTIVE) ERR-VOTING-CLOSED)
    (asserts! (< block-height (get ends-at proposal)) ERR-VOTING-CLOSED)

    ;; Adjust counts if changing vote
    (map-set proposals proposal-id
      (merge proposal {
        votes-for:
          (if vote-for
              (+ (get votes-for proposal)
                 (if (is-some previous-vote)
                     (if (unwrap-panic previous-vote) u0 u1)
                     u1))
              (if (is-some previous-vote)
                  (if (unwrap-panic previous-vote) (- (get votes-for proposal) u1) (get votes-for proposal))
                  (get votes-for proposal))),

        votes-against:
          (if vote-for
              (if (is-some previous-vote)
                  (if (unwrap-panic previous-vote) (get votes-against proposal) (- (get votes-against proposal) u1))
                  (get votes-against proposal))
              (+ (get votes-against proposal)
                 (if (is-some previous-vote)
                     (if (unwrap-panic previous-vote) u1 u0)
                     u1)))
      })
    )

    (map-set votes { proposal-id: proposal-id, voter: tx-sender } vote-for)

    (print { event: "vote-cast", proposal: proposal-id })
    (ok true)
  )
)

;; =============================
;; Finalize (Early Allowed)
;; =============================

(define-public (finalize-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
      (total-votes (+ (get votes-for proposal) (get votes-against proposal)))
      (quorum (var-get quorum-threshold))
      (pass-th (var-get pass-threshold))
      (passed (and
        (>= total-votes quorum)
        (> (* (get votes-for proposal) u100)
           (* total-votes pass-th))))
    )
    (asserts! (is-eq (get status proposal) STATUS-ACTIVE) ERR-INVALID-STATUS)

    ;; Allow finalize early if quorum met
    (asserts!
      (or (>= block-height (get ends-at proposal))
          (>= total-votes quorum))
      ERR-VOTING-OPEN)

    (map-set proposals proposal-id
      (merge proposal {
        status: (if passed STATUS-PASSED STATUS-FAILED)
      })
    )

    (print { event: "proposal-finalized", id: proposal-id, passed: passed })
    (ok passed)
  )
)

;; =============================
;; Execute Proposal
;; =============================

(define-public (execute-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    )
    (asserts! (is-eq (get status proposal) STATUS-PASSED) ERR-INVALID-STATUS)

    (map-set proposals proposal-id
      (merge proposal { status: STATUS-EXECUTED })
    )

    (print { event: "proposal-executed", id: proposal-id })
    (ok true)
  )
)

;; =============================
;; Cancel Proposal
;; =============================

(define-public (cancel-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get proposer proposal)) ERR-NOT-PROPOSER)
    (asserts! (is-eq (get status proposal) STATUS-ACTIVE) ERR-INVALID-STATUS)

    (map-set proposals proposal-id
      (merge proposal { status: STATUS-CANCELLED })
    )

    (print { event: "proposal-cancelled", id: proposal-id })
    (ok true)
  )
)
