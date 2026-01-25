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
    (get-balance (uint principal) (response uint uint))
    (deposit (uint uint) (response bool uint))
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
