import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setShow(true), 8);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: show ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0)',
        backdropFilter:       show ? 'blur(3px)' : 'blur(0px)',
        WebkitBackdropFilter: show ? 'blur(3px)' : 'blur(0px)',
        transition: 'background 0.22s ease, backdrop-filter 0.22s ease',
      }}
      onClick={onClose}
    >
      {/* ── Card ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 312,
          background: '#fff',
          borderRadius: 16,
          /* crisp ring + layered depth shadow */
          boxShadow:
            '0 0 0 1px rgba(0,0,0,0.06),' +
            '0 2px 4px rgba(0,0,0,0.04),' +
            '0 12px 32px rgba(0,0,0,0.13),' +
            '0 32px 64px rgba(0,0,0,0.06)',
          transform: show ? 'scale(1) translateY(0)'      : 'scale(0.94) translateY(12px)',
          opacity:   show ? 1                             : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.45,0.64,1), opacity 0.22s ease',
        }}
      >
        <div style={{ padding: '22px 22px 20px' }}>

          {/* Icon */}
          <div style={{
            width: 38, height: 38,
            borderRadius: 10,
            background: 'rgba(239,68,68,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <Trash2 size={17} strokeWidth={2.1} color="#EF4444" />
          </div>

          {/* Title */}
          <p style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            lineHeight: '20px',
            color: '#0A0A0A',
            letterSpacing: '-0.01em',
            marginBottom: 6,
          }}>
            Delete this record?
          </p>

          {/* Body */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12.5,
            lineHeight: '18px',
            color: '#6B6B6B',
            marginBottom: 20,
          }}>
            This is permanent — the record will be removed from the database and cannot be recovered.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                border: '1px solid #E8E8EC',
                background: 'transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                fontSize: 12.5,
                color: '#6B6B6B',
                cursor: 'pointer',
                transition: 'background 0.14s, color 0.14s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F6F6F8';
                e.currentTarget.style.color      = '#0A0A0A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color      = '#6B6B6B';
              }}
            >
              Cancel
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                border: 'none',
                background: '#EF4444',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: 12.5,
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239,68,68,0.32)',
                transition: 'background 0.14s, box-shadow 0.14s, transform 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = '#DC2626';
                e.currentTarget.style.boxShadow   = '0 4px 14px rgba(239,68,68,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = '#EF4444';
                e.currentTarget.style.boxShadow   = '0 2px 8px rgba(239,68,68,0.32)';
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e =>   { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Delete
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
