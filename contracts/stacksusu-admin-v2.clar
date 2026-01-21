;; StackSUSU Admin Contract
;; Handles protocol configuration, fees, and governance

;; ==============================================
;; CONSTANTS
;; ==============================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u1000))
(define-constant ERR-PAUSED (err u1021))
(define-constant ERR-ZERO-AMOUNT (err u1023))
(define-constant ERR-TRANSFER-FAILED (err u1017))

;; ==============================================
;; DATA VARIABLES
;; ==============================================

;; Protocol pause state
(define-data-var protocol-paused bool false)

;; Accumulated admin fees
(define-data-var total-fees-collected uint u0)

;; Admin fee basis points (0.5% default)
(define-data-var admin-fee-bps uint u50)

;; Emergency fee basis points (2% default)
(define-data-var emergency-fee-bps uint u200)

;; Treasury address for fee collection
(define-data-var treasury-address principal CONTRACT-OWNER)

;; Authorized contracts that can call admin functions
(define-map authorized-contracts principal bool)

;; ==============================================
;; AUTHORIZATION
;; ==============================================

(define-read-only (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-read-only (is-authorized-contract (caller principal))
  (default-to false (map-get? authorized-contracts caller))
)

(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (map-set authorized-contracts contract true))
  )
)

(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (map-delete authorized-contracts contract))
  )
)

;; ==============================================
;; PROTOCOL MANAGEMENT
;; ==============================================

(define-public (pause-protocol)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set protocol-paused true))
  )
)

(define-public (unpause-protocol)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set protocol-paused false))
  )
)

(define-read-only (is-paused)
  (var-get protocol-paused)
)

(define-public (set-admin-fee (new-fee-bps uint))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    ;; Max 5% admin fee
    (asserts! (<= new-fee-bps u500) ERR-NOT-AUTHORIZED)
    (ok (var-set admin-fee-bps new-fee-bps))
  )
)

(define-public (set-emergency-fee (new-fee-bps uint))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    ;; Max 10% emergency fee
    (asserts! (<= new-fee-bps u1000) ERR-NOT-AUTHORIZED)
    (ok (var-set emergency-fee-bps new-fee-bps))
  )
)

(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set treasury-address new-treasury))
  )
)

;; ==============================================
;; FEE MANAGEMENT
;; ==============================================

(define-read-only (get-admin-fee-bps)
  (var-get admin-fee-bps)
)

(define-read-only (get-emergency-fee-bps)
  (var-get emergency-fee-bps)
)

(define-read-only (get-treasury)
  (var-get treasury-address)
)

(define-read-only (get-total-fees)
  (var-get total-fees-collected)
)

;; Called by escrow to record fees
(define-public (record-fee (amount uint))
  (begin
    (asserts! (or (is-authorized-contract contract-caller) (is-contract-owner)) ERR-NOT-AUTHORIZED)
    (ok (var-set total-fees-collected (+ (var-get total-fees-collected) amount)))
  )
)

;; Withdraw accumulated fees to treasury
(define-public (withdraw-fees)
  (let
    (
      (fees (var-get total-fees-collected))
      (treasury (var-get treasury-address))
    )
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (> fees u0) ERR-ZERO-AMOUNT)
    (var-set total-fees-collected u0)
    (match (as-contract (stx-transfer? fees tx-sender treasury))
      success (ok fees)
      error ERR-TRANSFER-FAILED
    )
  )
)

;; ==============================================
;; VALIDATION HELPERS
;; ==============================================

(define-read-only (validate-contribution (amount uint))
  (and 
    (>= amount u500000)   ;; Min 0.5 STX
    (<= amount u10000000) ;; Max 10 STX
  )
)

(define-read-only (validate-member-count (count uint))
  (and
    (>= count u25)  ;; Min 25 members
    (<= count u50)  ;; Max 50 members
  )
)

(define-read-only (validate-payout-interval (interval-days uint))
  (and
    (>= interval-days u1)   ;; Min 1 day
    (<= interval-days u30)  ;; Max 30 days
  )
)

(define-read-only (blocks-per-day)
  u144
)

;; Calculate payout interval in blocks
(define-read-only (days-to-blocks (days uint))
  (* days u144)
)
