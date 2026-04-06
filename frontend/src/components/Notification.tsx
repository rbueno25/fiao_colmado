import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    container: {
      position: 'fixed' as const,
      top: '1.5rem',
      right: '1.5rem',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 9999,
      minWidth: '320px',
      maxWidth: '450px',
      animation: 'slide-in 0.3s ease-out forwards',
      background: 'white',
      border: '1px solid var(--border-color)',
    },
    icon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    title: {
      fontWeight: 700,
      fontSize: '0.9rem',
      marginBottom: '0.125rem',
    },
    message: {
      fontSize: '0.85rem',
      color: 'var(--color-text-muted)',
    },
    close: {
      cursor: 'pointer',
      opacity: 0.5,
      padding: '0.25rem',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    }
  };

  const config = {
    success: {
      icon: <CheckCircle style={{ color: '#10b981' }} size={20} />,
      title: '¡Éxito!',
      borderColor: '#10b981',
      bg: '#f0fdf4'
    },
    error: {
      icon: <XCircle style={{ color: '#ef4444' }} size={20} />,
      title: 'Error',
      borderColor: '#ef4444',
      bg: '#fef2f2'
    },
    warning: {
      icon: <AlertCircle style={{ color: '#f59e0b' }} size={20} />,
      title: 'Advertencia',
      borderColor: '#f59e0b',
      bg: '#fffbeb'
    },
    info: {
      icon: <Info style={{ color: '#3b82f6' }} size={20} />,
      title: 'Información',
      borderColor: '#3b82f6',
      bg: '#eff6ff'
    }
  };

  const current = config[type];

  return (
    <>
      <style>
        {`
          @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{ ...styles.container, borderLeft: `5px solid ${current.borderColor}`, backgroundColor: current.bg }}>
        <div style={styles.icon}>{current.icon}</div>
        <div style={styles.content}>
          <div style={{ ...styles.title, color: current.borderColor }}>{current.title}</div>
          <div style={styles.message}>{message}</div>
        </div>
        <div style={styles.close} onClick={onClose} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}>
          <X size={16} />
        </div>
      </div>
    </>
  );
};

export default Notification;
