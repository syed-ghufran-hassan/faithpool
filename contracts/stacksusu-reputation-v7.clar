;; StackSusu Reputation v7  
;; Simplified reputation system - no authorization required  
  
(define-constant CONTRACT-OWNER tx-sender)  
  
;; Error constants  
(define-constant ERR-NOT-FOUND (err u2001))  
(define-constant ERR-INVALID-SCORE (err u2002))  
(define-constant ERR-INIT-FAILED (err u2003))  
(define-constant ERR_CIRCLE_NOT_FOUND (err u2004))  
  
;; Score configuration  
(define-constant BASE-SCORE u500)  
(define-constant MAX-SCORE u1000)  
(define-constant MIN-SCORE u0)  
(define-constant MIN_REPUTATION_FLOOR u0)    
(define-constant DECAY_PRECISION u10000)  
  
;; Helper function for min  
(define-private (get-min (a uint) (b uint))  
  (if (<= a b) a b)  
)  
  
;; Member reputation data  
(define-map member-reputation  
  principal  
  {  
    score: uint,  
    contributions-made: uint,  
    contributions-missed: uint,  
    payouts-received: uint,  
    circles-joined: uint,  
    circles-completed: uint,  
    last-activity: uint,  
    initialized: bool  
  }  
)  
  
;; Track last decay per member per circle  
(define-map member-last-decay  
  { member: principal, circle-id: uint }  
  { last-decay-block: uint }  
)  
  
  
;; ============================================  
;; Core Functions  
;; ============================================  
  
(define-public (initialize-member (member principal))  
  (begin  
    (asserts! true ERR-INIT-FAILED) ;; Sets error type for function  
    (if (is-none (map-get? member-reputation member))  
      (map-set member-reputation member {  
        score: BASE-SCORE,  
        contributions-made: u0,  
        contributions-missed: u0,  
        payouts-received: u0,  
        circles-joined: u0,  
        circles-completed: u0,  
        last-activity: block-height,  
        initialized: true  
      })  
      true ;; Already exists, do nothing  
    )  
    (ok true)  
  )  
)  
  
(define-public (record-contribution (member principal))  
  (let  
    (  
      (rep (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: block-height, initialized: true  
      } (map-get? member-reputation member)))  
      (new-score (get-min MAX-SCORE (+ (get score rep) u10)))  
    )  
    (asserts! true ERR-INIT-FAILED)  
    (map-set member-reputation member (merge rep {  
      score: new-score,  
      contributions-made: (+ (get contributions-made rep) u1),  
      last-activity: block-height  
    }))  
    (ok new-score)  
  )  
)  
  
(define-public (record-missed-contribution (member principal))  
  (let  
    (  
      (rep (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: block-height, initialized: true  
      } (map-get? member-reputation member)))  
      (penalty (get-min (get score rep) u25))  
      (new-score (- (get score rep) penalty))  
    )  
    (asserts! true ERR-INIT-FAILED)  
    (map-set member-reputation member (merge rep {  
      score: new-score,  
      contributions-missed: (+ (get contributions-missed rep) u1),  
      last-activity: block-height  
    }))  
    (ok new-score)  
  )  
)  
  
(define-public (record-payout (member principal))  
  (let  
    (  
      (rep (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: block-height, initialized: true  
      } (map-get? member-reputation member)))  
    )  
    (asserts! true ERR-INIT-FAILED)  
    (map-set member-reputation member (merge rep {  
      payouts-received: (+ (get payouts-received rep) u1),  
      last-activity: block-height  
    }))  
    (ok true)  
  )  
)  
  
(define-public (record-circle-join (member principal))  
  (let  
    (  
      (rep (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: block-height, initialized: true  
      } (map-get? member-reputation member)))  
    )  
    (asserts! true ERR-INIT-FAILED)  
    (map-set member-reputation member (merge rep {  
      circles-joined: (+ (get circles-joined rep) u1),  
      last-activity: block-height  
    }))  
    (ok true)  
  )  
)  
  
(define-public (record-circle-complete (member principal))  
  (let  
    (  
      (rep (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: block-height, initialized: true  
      } (map-get? member-reputation member)))  
      (bonus (get-min u50 (- MAX-SCORE (get score rep))))  
    )  
    (asserts! true ERR-INIT-FAILED)  
    (map-set member-reputation member (merge rep {  
      score: (+ (get score rep) bonus),  
      circles-completed: (+ (get circles-completed rep) u1),  
      last-activity: block-height  
    }))  
    (ok true)  
  )  
)  
  
  
;; ============================================  
;; Decay Functions  
;; ============================================  
  
;; Apply decay to a single member  
(define-private (apply-member-decay   
  (member principal)  
  (decay-rate uint)  
  (current-block uint)  
)  
  (let   
    (  
      (rep (map-get? member-reputation member))  
    )  
    (match rep  
      rep-data  
        (let   
          (  
            (current-score (get score rep-data))  
            (last-activity (get last-activity rep-data))  
            (blocks-inactive (- current-block last-activity))  
          )  
          ;; Only apply decay if inactive for at least one decay interval  
          (if (>= blocks-inactive u4320)  ; ~30 days minimum  
            (let   
              (  
                (decay-amount (/ (* current-score decay-rate) DECAY_PRECISION))  
                (new-score (max MIN_REPUTATION_FLOOR (- current-score decay-amount)))  
              )  
              (map-set member-reputation member (merge rep-data {   
                score: new-score,  
                last-activity: current-block  
              }))  
              (ok { old-score: current-score, new-score: new-score })  
            )  
            (ok { old-score: current-score, new-score: current-score })  
          )  
        )  
      (err ERR-NOT-FOUND)  
    )  
  )  
)  
  
;; Public function to process decay for a circle  
(define-public (process-circle-decay (circle-id uint))  
  (let  
    (  
      (circle (contract-call? .stacksusu-core-v7 get-circle circle-id))  
      (current-block block-height)  
    )  
    (asserts! (is-some circle) ERR_CIRCLE_NOT_FOUND)  
      
    (match circle  
      circle-data  
        (let  
          (  
            (decay-rate (get reputation-decay-rate circle-data))  
            (last-decay (get last-decay-block circle-data))  
            (interval (get decay-interval circle-data))  
          )  
          (if (and (> decay-rate u0) (>= (- current-block last-decay) interval))  
            (begin  
              ;; Update last decay block in core contract  
              (try! (contract-call? .stacksusu-core-v7 update-last-decay-block circle-id current-block))  
                
              ;; Get all circle members and apply decay  
              (apply-decay-to-circle-members circle-id decay-rate current-block)  
            )  
            (ok u0)  ; Not time for decay yet or no decay configured  
          )  
        )  
      (err ERR_CIRCLE_NOT_FOUND)  
    )  
  )  
)  
  
;; Helper to apply decay to all circle members  
(define-private (apply-decay-to-circle-members   
  (circle-id uint)  
  (decay-rate uint)  
  (current-block uint)  
)  
  ;; This would need to iterate through members  
  ;; For now, return success - actual implementation depends on member iteration  
  (ok u0)  
)  
  
;; Check if decay is due for a circle  
(define-read-only (is-decay-due (circle-id uint))  
  (let  
    (  
      (circle (contract-call? .stacksusu-core-v7 get-circle circle-id))  
      (current-block block-height)  
    )  
    (match circle  
      circle-data  
        (ok (>= (- current-block (get last-decay-block circle-data))   
                (get decay-interval circle-data)))  
      (err ERR_CIRCLE_NOT_FOUND)  
    )  
  )  
)  
  
  
;; ============================================  
;; Read Functions  
;; ============================================  
  
(define-read-only (get-reputation (member principal))  
  (ok (default-to {  
    score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
    payouts-received: u0, circles-joined: u0, circles-completed: u0,  
    last-activity: u0, initialized: false  
  } (map-get? member-reputation member)))  
)  
  
(define-read-only (get-score (member principal))  
  (ok (get score (default-to {  
    score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
    payouts-received: u0, circles-joined: u0, circles-completed: u0,  
    last-activity: u0, initialized: false  
  } (map-get? member-reputation member))))  
)  
  
(define-read-only (is-initialized (member principal))  
  (is-some (map-get? member-reputation member))  
)  
  
(define-read-only (get-tier (member principal))  
  (let  
    (  
      (score (get score (default-to {  
        score: BASE-SCORE, contributions-made: u0, contributions-missed: u0,  
        payouts-received: u0, circles-joined: u0, circles-completed: u0,  
        last-activity: u0, initialized: false  
      } (map-get? member-reputation member))))  
    )  
    (if (>= score u900) u5      ;; Legendary  
      (if (>= score u750) u4    ;; Expert  
        (if (>= score u600) u3  ;; Advanced  
          (if (>= score u400) u2 ;; Intermediate  
            u1))))              ;; Beginner  
  )  
)
