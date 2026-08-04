import { useEffect, useRef, useState } from 'react'
import './Notification.css'

interface NotificationProps {
  message: string
  type?: 'error' | 'success' | 'info'
  visible: boolean
  onClose?: () => void
  onClick?: () => void
  duration?: number
}

export function Notification({ message, type = 'error', visible, onClose, onClick, duration = 5000 }: NotificationProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const autoHideRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exitRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    clearTimeout(autoHideRef.current);
    clearTimeout(exitRef.current);
    cancelAnimationFrame(rafRef.current!);

    if (visible) {
      setMounted(true);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setShow(true));
      });
      autoHideRef.current = setTimeout(() => {
        setShow(false);
      }, duration);
    } else {
      setShow(false);
    }
  }, [visible, duration]);

  useEffect(() => {
    clearTimeout(exitRef.current);
    if (!show && mounted) {
      exitRef.current = setTimeout(() => {
        setMounted(false);
        onClose?.();
      }, 350);
    }
  }, [show, mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className='notification-overlay'>
      <div className={`notification notification--${type} ${show ? 'notification--visible' : ''} ${onClick ? 'underline' : ''}`} onClick={onClick}>
        {message}
      </div>
    </div>
  )
}
