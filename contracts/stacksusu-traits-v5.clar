;; StackSusu Traits v5
;; Trait definitions for v7 contracts

(define-trait admin-trait
  (
    (is-paused () (response bool uint))
    (is-authorized-contract (principal) (response bool uint))
    (record-fee (uint) (response bool uint))
    (get-admin-fee-bps () (response uint uint))
  )
)

(define-trait core-trait
  (
    (get-circle (uint) (response 
      { 
        creator: principal,
        name: (string-ascii 50),
        contribution: uint,
        max-members: uint,
        status: uint,
        current-round: uint,
        member-count: uint
      } 
      uint))
    (get-member (uint principal) (response 
      { 
        slot: uint,
        joined-at: uint,
        contributions-made: uint
      } 
      uint))
  )
)

(define-trait escrow-trait
  (
    ;; Balance queries
    (get-balance (uint principal) (response uint uint))
    (get-circle-balance (uint) (response uint uint))
    (get-total-deposits (uint) (response uint uint))
    (get-total-withdrawals (uint) (response uint uint))
    
    ;; Operations
    (deposit (uint uint) (response bool uint))
    (withdraw (uint uint) (response bool uint))
    (emergency-withdraw (uint uint) (response uint uint)) ;; returns net amount after fee
    
    ;; Batch operations
    (batch-deposit ((list 20 { circle-id: uint, amount: uint })) (response bool uint))
    
    ;; History and statistics
    (get-escrow-stats (uint) (response 
      {
        total-balance: uint,
        total-deposits: uint,
        total-withdrawals: uint,
        member-count: uint,
        average-balance: uint
      }
      uint))
    
    (get-deposit-history (uint uint) (response 
      (list 10 {
        member: principal,
        amount: uint,
        timestamp: uint,
        block-height: uint
      })
      uint))
    
    ;; Fee calculation
    (calculate-withdrawal-fee (uint uint) (response uint uint))
    (calculate-emergency-fee (uint uint) (response uint uint))
  )
)

(define-trait reputation-trait
  (
    (get-score (principal) (response uint uint))
    (update-score (principal int) (response uint uint))
  )
)

(define-trait nft-trait
  (
    (get-owner (uint) (response (optional principal) uint))
  )
)
