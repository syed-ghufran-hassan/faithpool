import { forwardRef, useEffect, useCallback, useRef } from 'react';
import type { HTMLAttributes, ReactNode, MouseEvent } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      children,
      footer,
      headerAction,
      className,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const modalRef = forwardedRef || internalRef;
    const previousActiveElement = useRef<Element | null>(null);

    // Handle escape key
    const handleEscape = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // Handle overlay click
    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    // Focus management and event listeners
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement;
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        
        // Focus the modal
        setTimeout(() => {
          if (typeof modalRef === 'object' && modalRef?.current) {
            modalRef.current.focus();
          }
        }, 0);

        return () => {
          document.removeEventListener('keydown', handleEscape);
          document.body.style.overflow = '';
          
          // Restore focus
          if (previousActiveElement.current instanceof HTMLElement) {
            previousActiveElement.current.focus();
          }
        };
      }
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          ref={typeof modalRef === 'function' ? modalRef : internalRef}
          className={clsx(
            'modal',
            `modal--${size}`,
            className
          )}
          tabIndex={-1}
          {...props}
        >
          {(title || showCloseButton) && (
            <div className="modal__header">
              <div className="modal__header-content">
                {title && (
                  <h2 id="modal-title" className="modal__title">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="modal__description">
                    {description}
                  </p>
                )}
              </div>
              <div className="modal__header-actions">
                {headerAction}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="modal__close-button"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="modal__content">{children}</div>

          {footer && <div className="modal__footer">{footer}</div>}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

interface ModalActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

function ModalActions({ children, align = 'right' }: ModalActionsProps) {
  return (
    <div className={clsx('modal__actions', `modal__actions--${align}`)}>
      {children}
    </div>
  );
}

export { Modal, ModalActions };
export type { ModalProps, ModalActionsProps };
