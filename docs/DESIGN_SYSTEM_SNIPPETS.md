# 10 Snippets CSS Reutilizáveis

## 1. Button Premium 3D

### Before
```css
.button {
  padding: 12px 24px;
  background: #4169E1;
  border: none;
  border-radius: 8px;
  color: white;
}
```

### After
```css
.button-premium {
  /* Structure */
  position: relative;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  
  /* Colors */
  background: linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 50%));
  color: white;
  font-weight: 600;
  font-size: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  
  /* 3D Setup */
  transform-style: preserve-3d;
  transition: 
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  
  /* Shadows */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.2);
}

/* Shine effect */
.button-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to bottom,
    hsla(0, 0%, 100%, 0.2),
    transparent 50%,
    hsla(0, 0%, 0%, 0.05)
  );
  transform: translateZ(1px);
  pointer-events: none;
}

/* Hover */
.button-premium:hover {
  transform: translateY(-2px) translateZ(5px) scale(1.02);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.1),
    0 0 20px hsla(217, 91%, 60%, 0.3),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.3);
}

/* Active */
.button-premium:active {
  transform: translateY(0) translateZ(0) scale(0.98);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Focus */
.button-premium:focus-visible {
  outline: 2px solid hsl(217 91% 60%);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .button-premium {
    transition: none;
  }
  
  .button-premium:hover {
    transform: none;
  }
}
```

**Tailwind equivalent:**
```tsx
<button className="
  relative px-6 py-3 
  bg-gradient-to-br from-primary to-primary/90
  text-white font-semibold text-sm sm:text-base
  rounded-xl overflow-hidden
  transform-3d transition-all duration-200
  shadow-z2 hover:shadow-z3 hover:-translate-y-0.5 hover:scale-[1.02]
  active:translate-y-0 active:scale-[0.98]
  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
  before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none
  motion-reduce:transition-none motion-reduce:hover:transform-none
">
  Premium Button
</button>
```

---

## 2. Card Glass com Parallax

### Before
```css
.card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### After
```css
.card-glass {
  /* Structure */
  position: relative;
  padding: clamp(1rem, 0.75rem + 1.25vw, 1.5rem);
  border-radius: 1rem;
  overflow: hidden;
  
  /* Glassmorphism */
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: linear-gradient(
    135deg,
    hsla(0, 0%, 100%, 0.1),
    hsla(0, 0%, 100%, 0.05)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.2);
  
  /* Shadows */
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.4);
  
  /* 3D */
  transform-style: preserve-3d;
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* Glow background */
.card-glass::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    hsla(217, 91%, 60%, 0.1),
    transparent 70%
  );
  transform: translateZ(-1px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover */
.card-glass:hover {
  transform: translateY(-4px) rotateX(2deg);
  box-shadow: 
    0 12px 40px 0 rgba(31, 38, 135, 0.2),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.5);
}

.card-glass:hover::before {
  opacity: 1;
}

/* Dark mode */
.dark .card-glass {
  background: linear-gradient(
    135deg,
    hsla(0, 0%, 0%, 0.2),
    hsla(0, 0%, 0%, 0.1)
  );
  border-color: hsla(0, 0%, 100%, 0.1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card-glass,
  .card-glass::before {
    transition: none;
  }
  
  .card-glass:hover {
    transform: translateY(-2px);
  }
}
```

**Tailwind equivalent:**
```tsx
<div className="
  relative p-4 sm:p-5 md:p-6
  rounded-xl overflow-hidden
  glass-light dark:glass-dark
  shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
  transform-3d transition-all duration-300
  hover:-translate-y-1 hover:rotate-x-[2deg]
  hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.2)]
  before:absolute before:inset-0 before:-translate-x-1/2 before:-translate-y-1/2 
  before:w-[200%] before:h-[200%] before:opacity-0 hover:before:opacity-100
  before:bg-[radial-gradient(circle,hsla(217,91%,60%,0.1),transparent_70%)]
  before:pointer-events-none before:transition-opacity before:duration-300
  motion-reduce:transition-none motion-reduce:hover:transform-none
">
  Glass Card Content
</div>
```

---

## 3. Navbar com Glassmorphism & Blur

### Before
```css
.navbar {
  position: sticky;
  top: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
}
```

### After
```css
.navbar-glass {
  /* Position */
  position: sticky;
  top: 0;
  z-index: 100;
  
  /* Structure */
  padding: clamp(0.75rem, 0.5rem + 1vw, 1rem) clamp(1rem, 0.75rem + 1.25vw, 1.5rem);
  
  /* Glassmorphism */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background: hsla(0, 0%, 100%, 0.8);
  border-bottom: 1px solid hsla(0, 0%, 0%, 0.1);
  
  /* Shadow */
  box-shadow: 
    0 1px 3px 0 rgba(0, 0, 0, 0.05),
    0 10px 20px -5px rgba(0, 0, 0, 0.04);
  
  /* Transition */
  transition: 
    background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrolled state */
.navbar-glass.scrolled {
  background: hsla(0, 0%, 100%, 0.95);
  box-shadow: 
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 10px 20px -5px rgba(0, 0, 0, 0.08);
}

/* Dark mode */
.dark .navbar-glass {
  background: hsla(222, 47%, 11%, 0.8);
  border-bottom-color: hsla(0, 0%, 100%, 0.1);
}

.dark .navbar-glass.scrolled {
  background: hsla(222, 47%, 11%, 0.95);
}

/* High contrast */
@media (prefers-contrast: more) {
  .navbar-glass {
    backdrop-filter: none;
    background: hsl(0, 0%, 100%);
    border-bottom-width: 2px;
  }
  
  .dark .navbar-glass {
    background: hsl(222, 47%, 11%);
  }
}
```

**JavaScript para scroll state:**
```javascript
const navbar = document.querySelector('.navbar-glass');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});
```

---

## 4. Modal com Backdrop Blur

### Before
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
}
```

### After
```css
.modal-overlay {
  /* Position */
  position: fixed;
  inset: 0;
  z-index: 1000;
  
  /* Center content */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  /* Backdrop */
  backdrop-filter: blur(8px) brightness(0.8);
  -webkit-backdrop-filter: blur(8px) brightness(0.8);
  background: hsla(0, 0%, 0%, 0.4);
  
  /* Animation */
  animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content {
  /* Structure */
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: clamp(1.5rem, 1rem + 2vw, 2rem);
  border-radius: 1rem;
  
  /* Glassmorphism */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background: linear-gradient(
    135deg,
    hsla(0, 0%, 100%, 0.95),
    hsla(0, 0%, 100%, 0.9)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.3);
  
  /* Shadow */
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.6);
  
  /* 3D */
  transform-style: preserve-3d;
  
  /* Animation */
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dark mode */
.dark .modal-content {
  background: linear-gradient(
    135deg,
    hsla(222, 47%, 17%, 0.95),
    hsla(222, 47%, 17%, 0.9)
  );
  border-color: hsla(0, 0%, 100%, 0.1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-content {
    animation: none;
  }
}
```

**React Component:**
```tsx
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
};
```

---

## 5. Input com Efeito de Foco 3D

### Before
```css
.input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input:focus {
  border-color: #4169E1;
  outline: none;
}
```

### After
```css
.input-premium {
  /* Structure */
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  font-size: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  
  /* Colors */
  background: hsl(0, 0%, 100%);
  color: hsl(222, 47%, 11%);
  border: 1px solid hsl(214, 32%, 91%);
  
  /* Shadow */
  box-shadow: 
    0 1px 2px 0 rgba(0, 0, 0, 0.05),
    inset 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  
  /* Transition */
  transition: 
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
}

/* Placeholder */
.input-premium::placeholder {
  color: hsl(215, 16%, 65%);
}

/* Hover */
.input-premium:hover {
  border-color: hsl(217, 91%, 60%);
  box-shadow: 
    0 2px 4px 0 rgba(0, 0, 0, 0.05),
    inset 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

/* Focus */
.input-premium:focus {
  outline: none;
  border-color: hsl(217, 91%, 60%);
  transform: translateY(-1px) translateZ(2px);
  box-shadow: 
    0 0 0 4px hsla(217, 91%, 60%, 0.1),
    0 4px 8px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

/* Error state */
.input-premium.error {
  border-color: hsl(0, 72%, 51%);
}

.input-premium.error:focus {
  box-shadow: 
    0 0 0 4px hsla(0, 72%, 51%, 0.1),
    0 4px 8px 0 rgba(220, 38, 38, 0.1);
}

/* Success state */
.input-premium.success {
  border-color: hsl(142, 76%, 36%);
}

.input-premium.success:focus {
  box-shadow: 
    0 0 0 4px hsla(142, 76%, 36%, 0.1),
    0 4px 8px 0 rgba(21, 153, 71, 0.1);
}

/* Disabled */
.input-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: hsl(210, 40%, 98%);
}

/* Dark mode */
.dark .input-premium {
  background: hsl(217, 33%, 17%);
  color: hsl(210, 40%, 98%);
  border-color: hsl(217, 33%, 24%);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .input-premium:focus {
    transform: none;
  }
}
```

---

## 6. Tooltip 3D

### Before
```css
.tooltip {
  position: absolute;
  background: black;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
}
```

### After
```css
.tooltip-3d {
  /* Position */
  position: absolute;
  z-index: 1000;
  
  /* Structure */
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  max-width: 200px;
  
  /* Typography */
  font-size: 0.875rem;
  line-height: 1.5;
  text-align: center;
  color: white;
  
  /* Glassmorphism */
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: linear-gradient(
    135deg,
    hsla(222, 47%, 11%, 0.95),
    hsla(222, 47%, 11%, 0.9)
  );
  border: 1px solid hsla(0, 0%, 100%, 0.1);
  
  /* Shadow */
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1);
  
  /* 3D */
  transform-style: preserve-3d;
  
  /* Animation */
  animation: tooltipFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

/* Arrow */
.tooltip-3d::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

/* Arrow positions */
.tooltip-3d[data-position="top"]::before {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: hsla(222, 47%, 11%, 0.95);
}

.tooltip-3d[data-position="bottom"]::before {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: hsla(222, 47%, 11%, 0.95);
}

.tooltip-3d[data-position="left"]::before {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: hsla(222, 47%, 11%, 0.95);
}

.tooltip-3d[data-position="right"]::before {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: hsla(222, 47%, 11%, 0.95);
}

/* Animation */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tooltip-3d {
    animation: none;
  }
}
```

**React Component:**
```tsx
import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ content, children, position = 'top' }: TooltipProps) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div 
          className="tooltip-3d"
          data-position={position}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
```

---

## 7. Progress Bar Animada

### Before
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
}

.progress-fill {
  height: 100%;
  background: #4169E1;
  border-radius: 4px;
}
```

### After
```css
.progress-bar {
  /* Structure */
  position: relative;
  width: 100%;
  height: 0.75rem;
  border-radius: 9999px;
  overflow: hidden;
  
  /* Background */
  background: hsl(210, 40%, 96%);
  
  /* Shadow */
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.progress-fill {
  /* Structure */
  position: relative;
  height: 100%;
  border-radius: inherit;
  
  /* Gradient */
  background: linear-gradient(
    90deg,
    hsl(217, 91%, 60%),
    hsl(217, 91%, 70%)
  );
  
  /* Shadow */
  box-shadow: 
    0 0 10px hsla(217, 91%, 60%, 0.4),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.3);
  
  /* Animation */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
}

/* Shine effect */
.progress-fill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    hsla(0, 0%, 100%, 0.3),
    transparent
  );
  transform: translateX(-100%);
  animation: progressShine 2s infinite;
}

/* Pulse effect (for indeterminate state) */
.progress-fill.indeterminate {
  width: 30%;
  animation: progressPulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Animations */
@keyframes progressShine {
  to {
    transform: translateX(200%);
  }
}

@keyframes progressPulse {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(200%);
  }
}

/* Dark mode */
.dark .progress-bar {
  background: hsl(217, 33%, 17%);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .progress-fill::before,
  .progress-fill.indeterminate {
    animation: none;
  }
}
```

**React Component:**
```tsx
interface ProgressBarProps {
  value?: number; // 0-100
  indeterminate?: boolean;
  className?: string;
}

export const ProgressBar = ({ 
  value = 0, 
  indeterminate = false,
  className = '' 
}: ProgressBarProps) => {
  return (
    <div className={`progress-bar ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div 
        className={`progress-fill ${indeterminate ? 'indeterminate' : ''}`}
        style={{ width: indeterminate ? undefined : `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};
```

---

## 8. Badge com Glow Effect

### Before
```css
.badge {
  padding: 4px 8px;
  background: #4169E1;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}
```

### After
```css
.badge-glow {
  /* Structure */
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  
  /* Typography */
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  white-space: nowrap;
  
  /* Colors */
  background: linear-gradient(
    135deg,
    hsl(217, 91%, 60%),
    hsl(217, 91%, 50%)
  );
  color: white;
  border: 1px solid hsl(217, 91%, 70%);
  
  /* Glow */
  box-shadow: 
    0 0 10px hsla(217, 91%, 60%, 0.5),
    0 0 20px hsla(217, 91%, 60%, 0.3),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.2);
  
  /* 3D */
  transform-style: preserve-3d;
  transition: 
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dot indicator */
.badge-glow::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 4px hsla(0, 0%, 100%, 0.8);
  animation: badgePulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Hover */
.badge-glow:hover {
  transform: scale(1.05) translateZ(2px);
  box-shadow: 
    0 0 15px hsla(217, 91%, 60%, 0.6),
    0 0 30px hsla(217, 91%, 60%, 0.4),
    inset 0 1px 0 hsla(0, 0%, 100%, 0.3);
}

/* Variants */
.badge-glow.success {
  background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 28%));
  border-color: hsl(142, 76%, 46%);
  box-shadow: 
    0 0 10px hsla(142, 76%, 36%, 0.5),
    0 0 20px hsla(142, 76%, 36%, 0.3);
}

.badge-glow.warning {
  background: linear-gradient(135deg, hsl(38, 92%, 50%), hsl(38, 92%, 40%));
  border-color: hsl(38, 92%, 60%);
  box-shadow: 
    0 0 10px hsla(38, 92%, 50%, 0.5),
    0 0 20px hsla(38, 92%, 50%, 0.3);
}

.badge-glow.error {
  background: linear-gradient(135deg, hsl(0, 72%, 51%), hsl(0, 72%, 41%));
  border-color: hsl(0, 72%, 61%);
  box-shadow: 
    0 0 10px hsla(0, 72%, 51%, 0.5),
    0 0 20px hsla(0, 72%, 51%, 0.3);
}

/* Animation */
@keyframes badgePulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .badge-glow::before {
    animation: none;
  }
  
  .badge-glow:hover {
    transform: none;
  }
}
```

---

## 9. Accordion com Smooth Collapse

### Before
```css
.accordion-item {
  border: 1px solid #ddd;
  margin-bottom: 8px;
}

.accordion-content {
  padding: 16px;
  display: none;
}

.accordion-content.open {
  display: block;
}
```

### After
```css
.accordion-item {
  /* Structure */
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  
  /* Background */
  background: hsl(0, 0%, 100%);
  border: 1px solid hsl(214, 32%, 91%);
  
  /* Shadow */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  
  /* Transition */
  transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion-item:not(:last-child) {
  margin-bottom: 0.5rem;
}

.accordion-item:hover {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.accordion-trigger {
  /* Structure */
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  /* Typography */
  font-weight: 600;
  text-align: left;
  color: hsl(222, 47%, 11%);
  
  /* Transition */
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion-trigger:hover {
  background: hsl(210, 40%, 98%);
}

/* Icon */
.accordion-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: hsl(215, 16%, 47%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.accordion-item[data-state="open"] .accordion-icon {
  transform: rotate(180deg);
}

/* Content */
.accordion-content {
  overflow: hidden;
  transition: 
    height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height, opacity;
}

.accordion-content[data-state="closed"] {
  height: 0;
  opacity: 0;
}

.accordion-content[data-state="open"] {
  opacity: 1;
}

.accordion-content-inner {
  padding: 0 1.5rem 1rem 1.5rem;
  color: hsl(215, 16%, 47%);
  line-height: 1.625;
}

/* Dark mode */
.dark .accordion-item {
  background: hsl(217, 33%, 17%);
  border-color: hsl(217, 33%, 24%);
}

.dark .accordion-trigger {
  color: hsl(210, 40%, 98%);
}

.dark .accordion-trigger:hover {
  background: hsl(217, 33%, 20%);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .accordion-icon,
  .accordion-content {
    transition: none;
  }
}
```

---

## 10. Dropdown Menu 3D

### Before
```css
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 0;
}
```

### After
```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  /* Button styles (use button-premium as base) */
  cursor: pointer;
}

.dropdown-menu {
  /* Position */
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
  min-width: 12rem;
  
  /* Structure */
  padding: 0.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  
  /* Glassmorphism */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background: linear-gradient(
    135deg,
    hsla(0, 0%, 100%, 0.95),
    hsla(0, 0%, 100%, 0.9)
  );
  border: 1px solid hsla(0, 0%, 0%, 0.1);
  
  /* Shadow */
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 0 hsla(0, 0%, 100%, 0.5);
  
  /* 3D */
  transform-style: preserve-3d;
  
  /* Animation */
  animation: dropdownSlideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

/* Items */
.dropdown-item {
  /* Structure */
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  
  /* Typography */
  font-size: 0.875rem;
  color: hsl(222, 47%, 11%);
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  
  /* Transition */
  transition: 
    background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-item:hover {
  background: hsl(210, 40%, 98%);
  transform: translateX(2px);
}

.dropdown-item:active {
  background: hsl(210, 40%, 96%);
  transform: translateX(0);
}

/* Separator */
.dropdown-separator {
  height: 1px;
  margin: 0.5rem 0;
  background: hsl(214, 32%, 91%);
}

/* Icon in item */
.dropdown-item-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(215, 16%, 47%);
}

/* Animation */
@keyframes dropdownSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dark mode */
.dark .dropdown-menu {
  background: linear-gradient(
    135deg,
    hsla(222, 47%, 17%, 0.95),
    hsla(222, 47%, 17%, 0.9)
  );
  border-color: hsla(0, 0%, 100%, 0.1);
}

.dark .dropdown-item {
  color: hsl(210, 40%, 98%);
}

.dark .dropdown-item:hover {
  background: hsl(217, 33%, 20%);
}

.dark .dropdown-separator {
  background: hsl(217, 33%, 24%);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dropdown-menu {
    animation: none;
  }
  
  .dropdown-item:hover {
    transform: none;
  }
}
```

---

**Próximo**: Ver `DESIGN_SYSTEM_QA.md` para checklist de QA e plano de rollout.
