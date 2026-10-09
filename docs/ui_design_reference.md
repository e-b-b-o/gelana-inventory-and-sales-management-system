# Gelana UI Design Reference

## 1. Purpose
This document contains approved Stitch UI references for the Gelana application. Stitch designs are visual references, not production architecture or business logic.

## 2. Design Principles
Use rich aesthetics, modern typography, subtle micro-animations, and dynamic interactions to create a premium, state-of-the-art UI.

## 3. Brand System

### Primary
#0047FF

### Warm Background
#FFF8E7

## 4. Shared UI Patterns

### Navigation
### Top Bar
### Page Headers
### Tables
### Forms
### Cards
### Status Badges
### Dialogs
### Drawers
### Filters
### Empty States
### Loading States
### Error States

## 5. Stitch Screen References

### 5.1 Login

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:
[Add important UI notes]

---

### 5.2 Products & Categories

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.3 New Sale

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.4 Owner Dashboard

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.5 Current Inventory

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.6 Sale Details

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.7 Daily Closing

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.8 Transfer Details

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.9 Receiving

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

### 5.10 Reports

Status:
Approved

Stitch reference:
[Add Stitch code/reference here]

Implementation:
[Add implementation path later]

Notes:

---

## 6. Screen-Specific Business Constraints

Record only important UI constraints that developers must remember when implementing the screen.
Do not duplicate the complete business requirements here.

## 7. UI Change Process
Changes to UI must be documented and updated in this central reference.






## Approved Login Stitch reference 




<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Gelana - Inventory &amp; Sales Management</title>
<!-- Load Tailwind CSS v3 with plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#0047FF",
            "primary-hover": "#0037C7",
            "brand-warm": "#FFF8E7",
            "warm-border": "#F0E7D0",
            "dark-slate": "#0F172A",
            "muted-text": "#64748B",
            "input-bg": "#F8FAFC",
          },
          boxShadow: {
            'card': '0 24px 48px -12px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(0, 71, 255, 0.04)',
            'btn': '0 10px 24px -6px rgba(0, 71, 255, 0.38)',
          }
        }
      }
    }
  </script>
<!-- Google Fonts: Plus Jakarta Sans -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    /* Warm dotted micro-pattern on #FFF8E7 warm white canvas */
    .bg-warm-canvas {
      background-color: #FFF8E7;
      background-image: radial-gradient(rgba(0, 71, 255, 0.06) 1.25px, transparent 1.25px);
      background-size: 24px 24px;
    }
  </style>
</head>
<body class="bg-warm-canvas min-h-screen text-dark-slate flex flex-col justify-between selection:bg-[#0047FF] selection:text-white antialiased">
<!-- Header spacer / top container -->
<header class="w-full pt-8 pb-2 px-6 flex justify-center items-center">
<!-- Clean, quiet header space keeping focus entirely on the central workspace -->
</header>
<!-- BEGIN: Main Login Container -->
<main class="flex-grow flex items-center justify-center px-4 py-6">
<div class="w-full max-w-[460px]">
<!-- Elevated Login Card -->
<div class="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-neutral-200/60 relative">
<!-- Authentic Gelana Logo Display -->
<div class="flex flex-col items-center justify-center mb-6">
<div class="p-2 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
<img alt="Gelana Logo" class="h-20 w-20 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrCz8TI1A3-WmdKOBQvk0udu5hvxEdTwtDZCU5bMzbqoJPYSidb1koE5LTZ5Z78FA-JfmDePDUroYdZJ9gyUnz0Usy52gaDcRQ-m7ZsBmpoe5MK0x4Zx5tdkIFxa1VeIqNxWZ9zPDZ12I02I7gKJIYoflJ3EjAewKeRfQROOSVgPYk2oqxjzZt4jl1_CtS7GtDJ4PLf9z834CkD7v8kzgWnbNta2P5o3A0Dvh-82GaoQ5OXsCYNCgWcodSZGerDxCY"/>
</div>
</div>
<!-- Title & Subtitle -->
<div class="text-center mb-8">
<h1 class="text-2xl font-bold tracking-tight text-dark-slate sm:text-[26px]">
            Inventory &amp; Sales Management
          </h1>
<p class="text-sm text-muted-text mt-2 font-medium">
            Internal business management system for 3 branches
          </p>
</div>
<!-- Role-Neutral Login Form -->
<form class="space-y-5" onsubmit="event.preventDefault();">
<!-- Field 1: Email -->
<div>
<label class="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2" for="email">
              Email
            </label>
<div class="relative">
<input class="w-full rounded-xl border border-slate-200 bg-input-bg py-3.5 px-4 pl-11 text-sm font-semibold text-dark-slate placeholder:text-slate-400 placeholder:font-normal focus:border-[#0047FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047FF]/15 transition-all" id="email" placeholder="e.g. name@gelana.com" required="" type="email"/>
<span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</span>
</div>
</div>
<!-- Field 2: Password -->
<div>
<div class="flex justify-between items-center mb-2">
<label class="block text-xs font-bold uppercase tracking-wider text-muted-text" for="password">
                Password
              </label>
<a class="text-xs font-semibold text-[#0047FF] hover:underline focus:outline-none" href="#forgot-password">
                Forgot password?
              </a>
</div>
<div class="relative">
<input class="w-full rounded-xl border border-slate-200 bg-input-bg py-3.5 px-4 pl-11 pr-11 text-sm font-semibold text-dark-slate placeholder:text-slate-400 focus:border-[#0047FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047FF]/15 tracking-wider transition-all" id="password" placeholder="••••••••••••" required="" type="password"/>
<!-- Key/Lock left icon -->
<span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</span>
<!-- Toggle visibility button -->
<button aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none" id="toggle-password" type="button">
<svg class="w-5 h-5" fill="none" id="eye-icon" stroke="currentColor" viewbox="0 0 24 24">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</button>
</div>
</div>
<!-- Primary Submit Button -->
<div class="pt-2">
<button class="w-full py-4 px-6 rounded-xl bg-[#0047FF] hover:bg-[#0037C7] active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center justify-center gap-2 group" type="submit">
<span>Sign In</span>
<svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
</svg>
</button>
</div>
</form>
</div>
</div>
</main>
<!-- END: Main Login Container -->
<!-- BEGIN: Bottom Status Indicator -->
<footer class="w-full pb-8 pt-4 px-6 flex justify-center items-center">
<div class="inline-flex items-center gap-2 bg-white/90 border border-neutral-200/70 px-4 py-2 rounded-full shadow-sm">
<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="text-xs font-semibold text-dark-slate">System Status: <span class="text-emerald-600 font-bold">Online</span></span>
</div>
</footer>
<!-- END: Bottom Status Indicator -->
<!-- Script for toggle password -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
      const passwordInput = document.getElementById('password');
      const togglePasswordBtn = document.getElementById('toggle-password');
      const eyeIcon = document.getElementById('eye-icon');

      togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        if (isPassword) {
          // Eye closed slash icon
          eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
          `;
        } else {
          // Normal eye open
          eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          `;
        }
      });
    });
  </script>
</body></html>



#Gelana Stationery Management System - Product Catalog &amp; Categories


<!DOCTYPE html><html lang="en" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Gelana Stationery Management System - Product Catalog &amp; Categories</title>
<!-- Tailwind CSS CDN with forms and container plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gelana: {
              DEFAULT: '#0047FF',
              light: '#38BDF8',
              hover: '#003cd4',
              soft: '#eff4ff',
              cream: '#FFF8E7'
            }
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
          },
          boxShadow: {
            'soft-card': '0 8px 30px rgba(0, 0, 0, 0.04)',
            'floating': '0 14px 40px rgba(0, 71, 255, 0.08)'
          }
        }
      }
    }
  </script>
<!-- Google Fonts for Plus Jakarta Sans -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<style data-purpose="custom-scrollbars">
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  </style>
</head>
<body class="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen flex flex-col antialiased">
<!-- BEGIN: TopNavbar -->
<header class="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm" data-purpose="global-header">
<div class="px-6 py-3 flex items-center justify-between gap-4">
<!-- Brand & Global Search -->
<div class="flex items-center gap-8 flex-1 max-w-2xl">
<div class="flex items-center gap-3 shrink-0">
<img alt="Gelana Logo" class="h-9 w-auto object-contain rounded-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuNONDBTdJwDweiNhk-ejPc7v0XOJ4p-OhwMMzPMGLvVwK56qxij7Yv7BJM31fybHMJC-VJx9Z6AVlDc5pyvM1IvDSTIZ2Sk8BWGNnOhUIdAbWsmDCDizpSTj6oygNElozFSB2EbbVTQEEJSy5esn0MT6WlY7Djqu55P9ox9dmIDUcNr1wmQB_2xLg_j5zaX9DCQ3M_lMvQYyxxLYJfyweqGjIkFU4eqg--oOLWxUEiopo9mX4HL_8XJyz-QnZcHge">
</div>
<!-- Global Search Input -->
<div class="relative w-full max-w-md">
<span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</span>
<input class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gelana/20 focus:border-gelana transition-all" placeholder="Search by product name or SKU... (Ctrl + K)" type="search">
</div>
</div>
<!-- Right Action Indicators & Profile -->
<div class="flex items-center gap-4">
<!-- Live Sync Status Pill -->
<div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700" title="All nodes operational">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="">Online — Synced</span>
</div>
<!-- Branch Selector Dropdown -->
<div class="relative">
<button class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition" type="button">
<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="">All 3 Branches</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</button>
</div>
<!-- Notification Bell -->
<button aria-label="Notifications" class="relative p-2 rounded-xl text-slate-500 hover:text-gelana hover:bg-slate-100 transition">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
</button>
<div class="h-6 w-px bg-slate-200"></div>
<!-- User Profile -->
<div class="flex items-center gap-3 pl-1" data-purpose="user-profile-badge">
<div class="w-9 h-9 rounded-xl bg-gelana/10 border border-gelana/20 flex items-center justify-center font-bold text-gelana text-sm">
            SM
          </div>
<div class="hidden lg:block text-left">
<div class="text-xs font-bold text-slate-800 leading-tight">Zunaid Miller</div>
<div class="text-[11px] font-medium text-slate-500">Store Manager</div>
</div>
<svg class="w-3.5 h-3.5 text-slate-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
</div>
</div>
</header>
<!-- END: TopNavbar -->
<!-- BEGIN: MainLayoutContainer -->
<div class="flex-1 flex overflow-hidden">
<!-- BEGIN: LeftSidebar -->
<aside class="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0" data-purpose="sidebar-navigation">
<div class="p-4 space-y-1.5 flex-1 overflow-y-auto"><div class="px-3 py-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Menu</div>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Dashboard
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#"><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>Sales</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Inventory
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Transfers
</a>
<!-- Active Link: Products & Categories -->
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gelana text-white font-semibold text-sm shadow-sm transition" href="#">
<div class="flex items-center gap-3">
<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
<span class="">Products &amp; Categories</span>
</div>
<span class="w-2 h-2 rounded-full bg-white/70"></span>
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Suppliers
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Daily Closing
</a>
<div class="pt-4 px-3 py-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">System</div>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Reports
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Users &amp; Branches
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Notifications
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition" href="#">
<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Settings
</a></div>
<!-- Quick Warehouse Info Banner -->

</aside>
<!-- END: LeftSidebar -->
<!-- BEGIN: MainContentArea -->
<main class="flex-1 overflow-y-auto px-8 py-6 space-y-6" data-purpose="primary-catalog-view">
<!-- Page Header with Action Buttons -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
<p class="text-xs text-slate-500 mt-1">Manage catalog items, base &amp; alternate selling units, and multi-branch stock availability.</p>
</div>
<div class="flex items-center gap-3 shrink-0">
<button class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition" type="button">
            Manage Categories
          </button>
<button class="px-4 py-2.5 rounded-xl bg-gelana hover:bg-gelana-hover text-white text-xs font-bold shadow-md shadow-gelana/20 flex items-center gap-2 transition" type="button">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="">+ Add Product</span>
</button>
</div>
</div>
<!-- BEGIN: MetricCardsSection -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary">
<!-- Metric 1: Total SKUs -->
<div class="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft-card flex items-center justify-between">
<div>
<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SKUs</div>
<div class="text-2xl font-extrabold text-slate-900 mt-1">540</div>
<div class="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
<span class="">↑ +12 this month</span>
</div>
</div>
<div class="w-12 h-12 rounded-2xl bg-blue-50 text-gelana flex items-center justify-center">
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</div>
</div>
<!-- Metric 2: Active Products -->
<div class="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft-card flex items-center justify-between">
<div>
<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Products</div>
<div class="text-2xl font-extrabold text-slate-900 mt-1">512</div>
<div class="text-[11px] font-medium text-slate-500 mt-1">94.8% operational</div>
</div>
<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</div>
</div>
<!-- Metric 3: Low Stock Warnings -->
<div class="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft-card flex items-center justify-between">
<div>
<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</div>
<div class="text-2xl font-extrabold text-amber-600 mt-1">18</div>
<div class="text-[11px] font-medium text-amber-700 mt-1 flex items-center gap-1"><span class="">Below minimum stock</span></div>
</div>
<div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</div>
</div>
<!-- Metric 4: Catalog Categories -->
<div class="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-soft-card flex items-center justify-between">
<div>
<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Categories</div>
<div class="text-2xl font-extrabold text-slate-900 mt-1">9</div>
<div class="text-[11px] font-medium text-slate-500 mt-1">Across 3 branches</div>
</div>
<div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
</svg>
</div>
</div>
</section>
<!-- END: MetricCardsSection -->
<!-- BEGIN: TableCardSection -->
<section class="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card overflow-hidden" data-purpose="catalog-table-container">
<!-- Table Toolbar Filter Controls -->
<div class="p-5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4 bg-white"><div class="flex flex-wrap items-center gap-3 flex-1"><div class="relative w-full max-w-xs"><span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></span><input class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-gelana/20 focus:border-gelana" placeholder="Search product name or SKU..." type="text"></div><select class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gelana/20 focus:border-gelana"><option value="">All Categories (9)</option><option selected="" value="writing">Writing</option><option value="paper">Paper Goods</option><option value="desk">Desk Tools</option><option value="art">Art &amp; Craft</option></select><select class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gelana/20 focus:border-gelana"><option value="">All Brands</option><option value="gelana">Gelana</option><option value="pilot">Pilot</option><option value="fabercastell">Faber-Castell</option><option value="staedtler">Staedtler</option></select><select class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gelana/20 focus:border-gelana"><option value="">Status: All</option><option value="instock">In Stock</option><option value="lowstock">Low Stock</option><option value="outofstock">Out of Stock</option></select></div><div class="flex items-center gap-3 text-xs text-slate-500 font-medium"><span class="">Showing <strong class="text-slate-800">1 - 4</strong> of 540 items</span><div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50"><button class="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700 transition" disabled=""><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button><button class="p-1 hover:bg-white rounded text-slate-700 transition"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button></div></div></div>
<!-- Table Element -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse" id="products-table">
<thead><tr class="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider"><th class="py-3.5 px-5">Product &amp; SKU</th><th class="py-3.5 px-4">Category</th><th class="py-3.5 px-4">Brand</th><th class="py-3.5 px-4">Base Unit</th><th class="py-3.5 px-4">Alternate Unit</th><th class="py-3.5 px-4">Selling Price</th><th class="py-3.5 px-4">Stock (3 Branches)</th><th class="py-3.5 px-4">Status</th><th class="py-3.5 px-5 text-right">Actions</th></tr></thead>
<tbody class="divide-y divide-slate-100 text-xs"><tr class="bg-blue-50/40 hover:bg-blue-50/60 transition group font-medium"><td class="py-4 px-5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-blue-100 text-gelana font-bold flex items-center justify-center shrink-0">GP</div><div><div class="font-bold text-slate-900 group-hover:text-gelana transition">Gelana Premium Gel Pen 0.5mm</div><div class="text-[11px] text-slate-400 font-mono mt-0.5">SKU: GEL-00104</div></div></div></td><td class="py-4 px-4"><span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Writing</span></td><td class="py-4 px-4 font-semibold text-slate-700">Gelana</td><td class="py-4 px-4 text-slate-700">Piece</td><td class="py-4 px-4 text-slate-600">Box (12)</td><td class="py-4 px-4"><div class="font-bold text-slate-900">1.50 / pc</div><div class="text-[11px] text-slate-500">16.00 / box</div></td><td class="py-4 px-4"><div class="flex items-center gap-1.5"><span class="font-bold text-slate-800">142</span><span class="text-slate-400 font-normal">units</span></div><div class="text-[10px] text-slate-500">65 · 45 · 32</div></td><td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>In Stock</span></td><td class="py-4 px-5 text-right"><button class="p-1.5 rounded-lg text-slate-400 hover:text-gelana hover:bg-white transition" title="Quick view"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button></td></tr><tr class="hover:bg-slate-50 transition group"><td class="py-4 px-5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">HN</div><div><div class="font-bold text-slate-900 group-hover:text-gelana transition">Hardcover Notebook A5 Grid</div><div class="text-[11px] text-slate-400 font-mono mt-0.5">SKU: GEL-00105</div></div></div></td><td class="py-4 px-4"><span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Paper Goods</span></td><td class="py-4 px-4 font-semibold text-slate-700">Gelana</td><td class="py-4 px-4 text-slate-700">Book</td><td class="py-4 px-4 text-slate-600">Pack (5)</td><td class="py-4 px-4"><div class="font-bold text-slate-900">6.00 / bk</div><div class="text-[11px] text-slate-500">27.00 / pk</div></td><td class="py-4 px-4"><div class="flex items-center gap-1.5"><span class="font-bold text-amber-600">14</span><span class="text-slate-400 font-normal">units</span></div><div class="text-[10px] text-slate-500">8 · 4 · 2</div></td><td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Low Stock</span></td><td class="py-4 px-5 text-right"><button class="p-1.5 rounded-lg text-slate-400 hover:text-gelana hover:bg-slate-100 transition" title="Quick view"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button></td></tr><tr class="hover:bg-slate-50 transition group"><td class="py-4 px-5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">PS</div><div><div class="font-bold text-slate-900 group-hover:text-gelana transition">Precision Craft Scissors 6-inch</div><div class="text-[11px] text-slate-400 font-mono mt-0.5">SKU: GEL-00106</div></div></div></td><td class="py-4 px-4"><span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Desk Tools</span></td><td class="py-4 px-4 font-semibold text-slate-700">Staedtler</td><td class="py-4 px-4 text-slate-700">Unit</td><td class="py-4 px-4 text-slate-400 italic">None</td><td class="py-4 px-4"><div class="font-bold text-slate-900">4.25 / unit</div><div class="text-[11px] text-slate-400">-</div></td><td class="py-4 px-4"><div class="flex items-center gap-1.5"><span class="font-bold text-rose-600">0</span><span class="text-slate-400 font-normal">units</span></div><div class="text-[10px] text-slate-500">0 · 0 · 0</div></td><td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Out of Stock</span></td><td class="py-4 px-5 text-right"><button class="p-1.5 rounded-lg text-slate-400 hover:text-gelana hover:bg-slate-100 transition" title="Quick view"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button></td></tr><tr class="hover:bg-slate-50 transition group"><td class="py-4 px-5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">FH</div><div><div class="font-bold text-slate-900 group-hover:text-gelana transition">Fluorescent Highlighter 4-Pack</div><div class="text-[11px] text-slate-400 font-mono mt-0.5">SKU: GEL-00107</div></div></div></td><td class="py-4 px-4"><span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Writing</span></td><td class="py-4 px-4 font-semibold text-slate-700">Pilot</td><td class="py-4 px-4 text-slate-700">Pack</td><td class="py-4 px-4 text-slate-400 italic">None</td><td class="py-4 px-4"><div class="font-bold text-slate-900">5.00 / pack</div><div class="text-[11px] text-slate-400">-</div></td><td class="py-4 px-4"><div class="flex items-center gap-1.5"><span class="font-bold text-slate-800">88</span><span class="text-slate-400 font-normal">units</span></div><div class="text-[10px] text-slate-500">40 · 30 · 18</div></td><td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>In Stock</span></td><td class="py-4 px-5 text-right"><button class="p-1.5 rounded-lg text-slate-400 hover:text-gelana hover:bg-slate-100 transition" title="Quick view"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></button></td></tr></tbody>
</table>
</div>
<!-- Table Footer Info -->
<div class="px-5 py-3.5 bg-slate-50/50 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-gelana"></span>
<span class="">Selected item highlighted for detailed branch inspection.</span>
</div>

</div>
</section>
<!-- END: TableCardSection -->
</main>
<!-- END: MainContentArea -->
<!-- BEGIN: SlideOverDrawer -->
<aside class="w-96 bg-white border-l border-slate-200/90 shadow-xl flex flex-col shrink-0 z-20" data-purpose="product-detail-slideover">
<!-- Drawer Header -->
<div class="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50"><div>
<span class="text-[10px] uppercase font-bold tracking-widest text-gelana bg-blue-50 px-2 py-0.5 rounded">Product Details</span>
<h2 class="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">Gelana Premium Gel Pen 0.5mm</h2>
<div class="flex items-center gap-2 mt-1">
<span class="text-xs text-slate-500 font-mono">SKU: GEL-00104</span>
<span class="text-slate-300">•</span>
<span class="text-xs text-emerald-600 font-semibold">Active in 3 branches</span>
</div>
</div>
<button aria-label="Close Panel" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" onclick="this.closest('aside').classList.add('hidden')" title="Close Panel" type="button">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button></div>
<!-- Drawer Content Scrollable Area -->
<div class="flex-1 overflow-y-auto p-5 space-y-6"><!-- Branch Inventory Breakdown Card -->
<div class="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm" data-purpose="branch-inventory-breakdown">
<div class="flex items-center justify-between mb-3">
<h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
<svg class="w-4 h-4 text-gelana" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Branch Breakdown
</h3>
<span class="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">142 Total Units</span>
</div>
<div class="space-y-2.5 text-xs">
<div class="p-2.5 rounded-xl bg-slate-50">
<div class="flex items-center justify-between"><span class="font-semibold text-slate-800">Branch 1</span><span class="font-bold text-slate-900">65 units</span></div>
<div class="flex items-center justify-between text-[11px] text-slate-500 mt-1"><span class="">Sellable: 64 units</span><span class="text-rose-600">Damaged: 1</span></div>
</div>
<div class="p-2.5 rounded-xl bg-slate-50">
<div class="flex items-center justify-between"><span class="font-semibold text-slate-800">Branch 2</span><span class="font-bold text-slate-900">45 units</span></div>
<div class="flex items-center justify-between text-[11px] text-slate-500 mt-1"><span class="">Sellable: 45 units</span><span class="text-slate-400">Damaged: 0</span></div>
</div>
<div class="p-2.5 rounded-xl bg-slate-50">
<div class="flex items-center justify-between"><span class="font-semibold text-slate-800">Branch 3</span><span class="font-bold text-slate-900">32 units</span></div>
<div class="flex items-center justify-between text-[11px] text-slate-500 mt-1"><span class="">Sellable: 32 units</span><span class="text-slate-400">Damaged: 0</span></div>
</div>
</div>
<div class="mt-4 pt-3 border-t border-slate-100">
<div class="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
<span class="">Minimum Stock Level</span>
<span class="font-semibold text-slate-700">Threshold: 20 units</span>
</div>
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-gelana h-full rounded-full" style="width: 71%"></div>
</div>
<div class="text-[10px] text-slate-600 font-medium mt-1.5 flex items-center justify-between">
<span class="text-emerald-700 font-semibold">Status: In Stock</span>
<span class="text-slate-500">Total Sellable: 141 units</span>
</div>
</div>
</div>

<!-- Unit Pricing & Costing Configuration -->
<div class="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm" data-purpose="unit-pricing-table">
<div class="flex items-center justify-between mb-3">
<h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
<svg class="w-4 h-4 text-gelana" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
Selling Prices &amp; Costing
</h3>
</div>
<table class="w-full text-xs">
<thead>
<tr class="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 pb-1">
<th class="text-left font-semibold pb-1.5">Selling Unit</th>
<th class="text-right font-semibold pb-1.5">Price</th>
<th class="text-right font-semibold pb-1.5">Weighted Average Cost (Owner Only)</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100">
<tr>
<td class="py-2.5 font-bold text-slate-800">Piece (Base)</td>
<td class="py-2.5 text-right font-bold text-slate-900">1.50</td>
<td class="py-2.5 text-right text-slate-600 font-mono">0.80</td>
</tr>
<tr>
<td class="py-2.5 font-bold text-slate-800">Box of 12 (Alt)</td>
<td class="py-2.5 text-right font-bold text-slate-900">16.00</td>
<td class="py-2.5 text-right text-slate-600 font-mono">9.00</td>
</tr>
</tbody>
</table>
</div>

<!-- Comprehensive Product Specifications Card -->
<div class="rounded-2xl border border-slate-200 p-4 bg-[#FFF8E7]/50" data-purpose="meta-info">
<div class="text-[11px] text-slate-600 space-y-2">
<div class="flex justify-between"><span class="text-slate-500">Brand:</span><span class="font-bold text-slate-800">Gelana</span></div>
<div class="flex justify-between"><span class="text-slate-500">SKU:</span><span class="font-mono font-bold text-slate-800">GEL-00104</span></div>
<div class="flex justify-between"><span class="text-slate-500">Category:</span><span class="font-semibold text-slate-800">Writing</span></div>
<div class="flex justify-between"><span class="text-slate-500">Description/Specs:</span><span class="font-medium text-slate-800 text-right">0.5mm quick-dry Japanese gel ink, archival quality</span></div>
<div class="flex justify-between"><span class="text-slate-500">Base Selling Unit:</span><span class="font-semibold text-slate-800">Piece</span></div>
<div class="flex justify-between"><span class="text-slate-500">Alternate Selling Unit:</span><span class="font-semibold text-slate-800">Box</span></div>
<div class="flex justify-between"><span class="text-slate-500">Conversion Ratio:</span><span class="font-bold text-gelana">1 Box = 12 Pieces</span></div>
<div class="flex justify-between border-t border-amber-200/50 pt-1.5"><span class="text-slate-500">Product Status:</span><span class="font-bold text-emerald-700">Active</span></div>
</div>
</div></div>
<!-- Drawer Footer Quick Actions -->
<div class="p-5 border-t border-slate-200 bg-white flex items-center gap-3">
<button class="flex-1 py-2.5 px-4 bg-gelana hover:bg-gelana-hover text-white text-xs font-bold rounded-xl shadow-md shadow-gelana/20 transition text-center" type="button">
          Edit Product
        </button>
<button class="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition" type="button">
          Deactivate
        </button>
</div>
</aside>
<!-- END: SlideOverDrawer -->
</div>
<!-- END: MainLayoutContainer -->


</body></html>




#New Sale 


<!DOCTYPE html><html lang="en" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Gelana Stationery — New Sale</title>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Plus Jakarta Sans Font -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "secondary-fixed": "#e9e2d2",
            "error-container": "#ffdad6",
            "surface-container": "#e8eefe",
            "background": "#f9f9ff",
            "on-error-container": "#93000a",
            "surface-dim": "#d4daea",
            "on-tertiary": "#ffffff",
            "secondary": "#625e51",
            "tertiary-container": "#b82800",
            "tertiary-fixed": "#ffdad2",
            "inverse-surface": "#2a303d",
            "surface-variant": "#dde2f3",
            "tertiary-fixed-dim": "#ffb4a2",
            "surface": "#f9f9ff",
            "on-tertiary-container": "#ffd1c6",
            "on-primary-fixed-variant": "#0033c0",
            "surface-bright": "#f9f9ff",
            "surface-container-low": "#f1f3ff",
            "on-tertiary-fixed-variant": "#8a1c00",
            "secondary-container": "#e6dfcf",
            "primary-fixed-dim": "#b9c3ff",
            "surface-container-high": "#e3e8f9",
            "on-error": "#ffffff",
            "inverse-primary": "#b9c3ff",
            "on-primary": "#ffffff",
            "on-secondary-fixed-variant": "#4a473b",
            "primary-fixed": "#dde1ff",
            "surface-container-highest": "#dde2f3",
            "outline-variant": "#c4c5da",
            "primary": "#0035c5",
            "on-background": "#161c27",
            "secondary-fixed-dim": "#ccc6b6",
            "on-primary-fixed": "#001257",
            "primary-container": "#0047ff",
            "on-surface-variant": "#434657",
            "on-primary-container": "#d4d9ff",
            "on-secondary-container": "#666255",
            "outline": "#747688",
            "error": "#ba1a1a",
            "on-secondary-fixed": "#1e1c12",
            "on-secondary": "#ffffff",
            "surface-tint": "#0046fa",
            "tertiary": "#8d1c00",
            "on-tertiary-fixed": "#3d0700",
            "inverse-on-surface": "#ecf0ff",
            "on-surface": "#161c27",
            "surface-container-lowest": "#ffffff"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "margin": "2rem",
            "gutter-mobile": "0.75rem",
            "space-lg": "1.5rem",
            "space-sm": "0.5rem",
            "gutter": "1.25rem",
            "space-xs": "0.25rem",
            "space-md": "1rem",
            "margin-mobile": "1rem",
            "space-xl": "2rem"
          },
          "fontFamily": {
            "headline-sm": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
</head>
<body class="bg-surface text-on-surface antialiased flex min-h-screen">
<!-- SideNavBar Component -->
<aside class="fixed top-0 left-0 h-screen w-64 flex flex-col z-40 bg-surface-container-lowest border-r border-outline-variant select-none">
<!-- Top Branding Anchor -->
<div class="px-5 py-5 border-b border-outline-variant flex items-center gap-3"><div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low flex items-center justify-center border border-outline-variant"><img alt="Gelana Logo" class="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWR09XCWutZwc6M0hU-14S-R5V06oolgzln7GRtaQxSNmWsSQYhOf_1K-bjB7lhk67Feone4vSrddwJhGpiYO79wduULbIul3fwj5iU8vB1CVu0jKV1gaAs02JoMTmvgWszbJRthVXac1PFX9AxhF2Jprp3jgkEwPM2tcdQPWu-I0UxzP8vj9m25tkRh1ZS2hGSG2-i62aJuGczWQ36pppxXTj7qGIM6yc3r83MCI3iYUQiwLs3A5-oUY0eKvNXmbk"></div><div class="flex flex-col"><span class="text-headline-sm font-headline-sm font-bold text-primary leading-tight">Gelana</span><span class="text-label-sm font-label-sm text-on-surface-variant">Internal Inventory &amp; Sales</span></div></div>
<!-- Read-only Branch Context Badge -->
<div class="px-4 py-3 bg-surface-container-low mx-3 mt-3 rounded-lg border border-outline-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-body-md" data-icon="storefront">storefront</span>
<span class="text-label-md font-label-md text-on-surface">Branch 1</span>
</div>
<span class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">Available Products — Branch 1</span>
</div>
<!-- Navigation Tab List -->
<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1"><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined" data-icon="dashboard">dashboard</span><span class="text-label-md font-label-md">Dashboard</span></a><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container text-primary font-semibold border-l-4 border-primary transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined text-primary" data-icon="receipt_long" style="font-variation-settings: 'FILL' 1;">receipt_long</span><span class="text-label-md font-label-md">Sales</span></a><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span><span class="text-label-md font-label-md">Inventory</span></a><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined" data-icon="swap_horiz">swap_horiz</span><span class="text-label-md font-label-md">Transfers</span></a><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined" data-icon="event_available">event_available</span><span class="text-label-md font-label-md">Daily Closing</span></a><a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined" data-icon="notifications">notifications</span><span class="text-label-md font-label-md">Notifications</span></a></nav>
<!-- SideNav CTA & Footers -->
<div class="p-3 border-t border-outline-variant space-y-2"><div class="space-y-1"><a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#"><span class="material-symbols-outlined text-body-md" data-icon="manage_accounts">manage_accounts</span><span class="text-label-md font-label-md">Account / Security</span></a></div></div>
</aside>
<!-- Top Navigation Bar & Workspace Wrapper -->
<div class="ml-64 flex-1 flex flex-col min-w-0">
<!-- TopNavBar Component -->
<header class="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center justify-between">
<!-- Search & Page Identification -->
<div class="flex items-center gap-4 flex-1 max-w-xl">
<div class="relative w-full">
<span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
<span class="material-symbols-outlined text-body-lg" data-icon="search">search</span>
</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Search product by name or SKU..." type="text">

</div>
</div>
<!-- Center Operational Secondary Links -->

<!-- Right Trailing Profile & Actions -->
<div class="flex items-center gap-3">
<!-- Live Sync Status -->
<div class="flex items-center gap-2 px-2.5 py-1 bg-surface-container-low rounded-full border border-outline-variant">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="text-label-sm font-label-sm text-on-surface">Online — All synced</span>
</div>
<!-- Trailing action icon buttons -->
<div class="flex items-center border-l border-outline-variant pl-3 gap-1">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors" title="Sync">
<span class="material-symbols-outlined text-body-lg" data-icon="sync">sync</span>
</button>

<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors relative" title="Notifications">
<span class="material-symbols-outlined text-body-lg" data-icon="notifications">notifications</span>
<span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-container rounded-full"></span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors" title="Help">
<span class="material-symbols-outlined text-body-lg" data-icon="help_outline">help_outline</span>
</button>
</div>
<!-- Cashier Officer Profile -->
<div class="flex items-center gap-2.5 pl-2 border-l border-outline-variant">
<div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md" title="Branch Cashier Duty Officer Badge">
            ST
          </div>
<div class="flex flex-col text-left">
<span class="text-label-md font-label-md text-on-surface leading-tight">Selamawit T.</span>
<span class="text-label-sm font-label-sm text-outline">Employee</span>
</div>
</div>
</div>
</header>
<!-- Main Operational Workspace -->
<main class="flex-1 p-6 space-y-6 overflow-x-hidden">
<!-- Breadcrumb, Page Title & Operational Metas -->
<div class="flex flex-wrap items-center justify-between gap-4"><div class=""><div class="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant mb-1"><span class="">Branch 1</span><span class="material-symbols-outlined text-label-sm" data-icon="chevron_right">chevron_right</span><span class="text-primary font-semibold">New Sale</span></div><h1 class="text-headline-lg font-headline-lg text-on-surface">New Sale</h1></div><div class="flex items-center gap-3"><span class="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-label-md font-label-md text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-body-md" data-icon="calendar_today">calendar_today</span>Today, Oct 24, 2025</span></div></div>
<!-- Split 2-Column Desktop Grid Layout -->
<div class="grid grid-cols-12 gap-6 items-start">
<!-- Left & Center Workspace: Product Catalog & Active Sale Items (Col 12 to 8) -->
<div class="col-span-12 xl:col-span-8 space-y-6">
<!-- 1. Quick Category Filter Bar & Quick Catalog Adds -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-3">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md text-on-surface uppercase tracking-wider">Quick Category Filter</span>
<span class="text-label-sm font-label-sm text-outline">Available Products — Branch 1</span>
</div>
<!-- Category Chips -->
<div class="flex flex-wrap gap-2">
<button class="px-3 py-1.5 rounded-full bg-primary-container text-on-primary text-label-md font-label-md">All</button>
<button class="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-label-md font-label-md border border-outline-variant transition-colors">Paper &amp; Notebooks</button>
<button class="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-label-md font-label-md border border-outline-variant transition-colors">Writing Instruments</button>
<button class="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-label-md font-label-md border border-outline-variant transition-colors">Office Essentials</button>
<button class="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-label-md font-label-md border border-outline-variant transition-colors">Art Supplies</button>
<button class="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-label-md font-label-md border border-outline-variant transition-colors">Binding &amp; Filing</button>
</div>
<!-- Quick-add Catalog Cards (Bento Strip) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2"><div class="flex items-center gap-4 text-label-md font-label-md text-on-surface-variant"><span class="">Items count: <strong class="text-on-surface">3</strong></span><span class="">Total Unit count: <strong class="text-on-surface">3</strong></span></div></div>
</div>
<!-- 2. Active Sale Line Items Table Card -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
<!-- Card Header -->
<div class="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-headline-sm" data-icon="shopping_basket">shopping_basket</span>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Sale Items</h3>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-label-sm font-label-sm font-bold">3 Items</span>
</div>
<div class="flex items-center gap-2">
<span class="text-label-sm font-label-sm text-outline">Branch: <strong class="text-on-surface">Branch 1</strong></span>
</div>
</div>
<!-- Line Items Table -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant">
<th class="py-3 px-4">Item &amp; SKU</th>
<th class="py-3 px-3">Selling Unit</th>
<th class="py-3 px-3">Available Stock</th>
<th class="py-3 px-3 w-32">Qty</th>
<th class="py-3 px-4 text-right">Unit Price</th>
<th class="py-3 px-4 text-right">Line Total</th>
<th class="py-3 px-3 text-center w-12">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant text-body-md font-body-md text-on-surface">
<!-- Row 1: Standard Unit (Double A Copy Paper) -->
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="py-3.5 px-4">
<div class="font-semibold text-on-surface">Double A A4 Copy Paper 80gsm</div>
<div class="text-label-sm font-label-sm text-outline">SKU-PAP-102 • Paper &amp; Notebooks</div>
</td>
<td class="py-3.5 px-3">
<select class="text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 focus:border-primary focus:ring-0">
<option selected="">Box (5 Reams)</option>
<option>Ream (Base)</option>
</select>
<div class="text-label-sm font-label-sm text-outline mt-0.5">1 Box = 5 Reams</div>
</td>
<td class="py-3.5 px-3">
<span class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">48 Reams</span>
</td>
<td class="py-3.5 px-3">
<div class="flex items-center border border-outline-variant rounded-md w-28 bg-surface-container-lowest">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">-</button>
<input class="w-full text-center border-0 p-1 text-body-md font-semibold focus:ring-0" max="9" min="1" type="number" value="1">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">+</button>
</div>
</td>
<td class="py-3.5 px-4 text-right font-medium">
                      850.00
                      <div class="text-label-sm font-label-sm text-outline">Configured Price</div>
</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface">
                      850.00
                    </td>
<td class="py-3.5 px-3 text-center">
<button class="text-outline hover:text-error transition-colors p-1" title="Remove Line">
<span class="material-symbols-outlined text-body-lg" data-icon="delete">delete</span>
</button>
</td>
</tr>
<!-- Row 2: Alternate Unit (Bic Cristal Pens) -->
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="py-3.5 px-4">
<div class="font-semibold text-on-surface">Bic Cristal Medium Ballpoint Pen - Blue</div>
<div class="text-label-sm font-label-sm text-outline">SKU-PEN-044 • Writing Instruments</div>
</td>
<td class="py-3.5 px-3">
<select class="text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 focus:border-primary focus:ring-0">
<option>Piece (Base)</option>
<option selected="">Pack (20 Pcs)</option>
</select>
<div class="text-label-sm font-label-sm text-outline mt-0.5">1 Pack = 20 Pcs</div>
</td>
<td class="py-3.5 px-3">
<span class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">180 Pcs</span>
</td>
<td class="py-3.5 px-3">
<div class="flex items-center border border-outline-variant rounded-md w-28 bg-surface-container-lowest">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">-</button>
<input class="w-full text-center border-0 p-1 text-body-md font-semibold focus:ring-0" max="9" min="1" type="number" value="1">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">+</button>
</div>
</td>
<td class="py-3.5 px-4 text-right font-medium">
                      280.00
                      <div class="text-label-sm font-label-sm text-outline">Configured Price</div>
</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface">
                      280.00
                    </td>
<td class="py-3.5 px-3 text-center">
<button class="text-outline hover:text-error transition-colors p-1" title="Remove Line">
<span class="material-symbols-outlined text-body-lg" data-icon="delete">delete</span>
</button>
</td>
</tr>
<!-- Row 3: Strict Stock Limit Validation (Low Stock Alert Row) -->
<tr class="bg-amber-50/20 border-l-4 border-l-amber-500">
<td class="py-3.5 px-4">
<div class="font-semibold text-on-surface">Kangaro Stapler Heavy Duty 24/6</div>
<div class="text-label-sm font-label-sm text-outline">SKU-STP-019 • Office Essentials</div>
</td>
<td class="py-3.5 px-3">
<select class="text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 focus:border-primary">
<option selected="">Piece (Base Unit)</option>
</select>
<div class="text-label-sm font-label-sm text-outline mt-0.5">Direct Unit</div>
</td>
<td class="py-3.5 px-3">
<span class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">3 Pcs Avail</span>
</td>
<td class="py-3.5 px-3">
<div class="space-y-1">
<div class="flex items-center border border-amber-400 bg-surface-container-lowest rounded-md w-28">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">-</button>
<input class="w-full text-center border-0 p-1 text-body-md font-semibold text-amber-900 focus:ring-0" max="3" min="1" type="number" value="1">
<button class="px-2 py-1 text-on-surface-variant hover:bg-surface-container-low text-label-md font-bold">+</button>
</div>
<span class="text-[10px] text-amber-800 font-semibold block leading-tight">Stock alert: 3 left</span>
</div>
</td>
<td class="py-3.5 px-4 text-right font-medium">
                      120.00
                      <div class="text-label-sm font-label-sm text-outline">Configured Price</div>
</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface">
                      120.00
                    </td>
<td class="py-3.5 px-3 text-center">
<button class="text-outline hover:text-error transition-colors p-1" title="Remove Line">
<span class="material-symbols-outlined text-body-lg" data-icon="delete">delete</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Footer Actions -->
<div class="p-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between"><div class="flex items-center gap-4 text-label-md font-label-md text-on-surface-variant"><span class="">Items count: <strong class="text-on-surface">3</strong></span><span class="">Total Unit count: <strong class="text-on-surface">3</strong></span></div></div>
</div>
<!-- Offline First Status Card -->

</div>
<!-- Right Section: Sale Breakdown, Discount & Split Payment Terminal (Col 12 to 4) -->
<div class="col-span-12 xl:col-span-4 space-y-6">
<!-- 1. Sale Breakdown Card -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4"><div class="flex items-center justify-between pb-3 border-b border-outline-variant"><h3 class="text-headline-sm font-headline-sm text-on-surface">Sale Items</h3><span class="text-label-sm font-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">Available Products — Branch 1</span></div><div class="space-y-3"><div class="flex justify-between text-body-md font-body-md"><span class="text-on-surface-variant">Subtotal</span><span class="font-semibold text-on-surface">1,250.00</span></div><div class="p-3 rounded-lg bg-surface-container-low border border-outline-variant space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-1.5 text-label-md font-label-md text-on-surface"><span class="material-symbols-outlined text-body-md text-primary" data-icon="percent">percent</span><span class="">Discount</span></div></div><div class="flex items-center gap-2"><div class="relative flex-1"><input class="w-full text-right py-1 px-2 text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded text-on-surface" type="text" value="50.00"><span class="absolute left-2 top-1 text-label-sm text-outline">Fixed</span></div><button class="px-2.5 py-1 text-label-md font-label-md bg-surface-container text-primary rounded border border-outline-variant">Apply</button></div></div><div class="flex justify-between text-body-md font-body-md text-emerald-700"><span class="">Applied Discount</span><span class="font-semibold">- 50.00</span></div><div class="pt-3 border-t border-outline-variant flex items-baseline justify-between"><div><span class="text-label-lg font-label-lg text-on-surface">Total</span></div><span class="text-headline-xl font-headline-xl text-primary tracking-tight">1,200.00</span></div></div></div>
<!-- 2. Split Payment Methods Card -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4"><div class="flex items-center justify-between pb-3 border-b border-outline-variant"><div><h3 class="text-headline-sm font-headline-sm text-on-surface">Sale Items</h3><span class="text-label-sm font-label-sm text-outline">Select one or split across methods</span></div><button class="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-0.5"><span class="material-symbols-outlined text-body-md" data-icon="add">add</span>Split Method</button></div><div class="space-y-3"><div class="p-3 rounded-lg border border-outline-variant bg-surface-container-lowest space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" data-icon="payments">payments</span><span class="text-label-md font-label-md text-on-surface font-semibold">Cash</span></div><button class="text-outline hover:text-error transition-colors"><span class="material-symbols-outlined text-body-md" data-icon="close">close</span></button></div><div class="flex items-center gap-2"><span class="text-label-sm font-label-sm text-outline">Amount:</span><input class="flex-1 text-right py-1 px-2.5 font-bold text-headline-sm bg-surface-container-low border border-outline-variant rounded text-on-surface focus:border-primary" type="text" value="700.00"></div></div><div class="p-3 rounded-lg border border-outline-variant bg-surface-container-lowest space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" data-icon="account_balance">account_balance</span><span class="text-label-md font-label-md text-on-surface font-semibold">Digital / Bank Transfer</span></div><button class="text-outline hover:text-error transition-colors"><span class="material-symbols-outlined text-body-md" data-icon="close">close</span></button></div><div class="flex items-center gap-2"><span class="text-label-sm font-label-sm text-outline">Amount:</span><input class="flex-1 text-right py-1 px-2.5 font-bold text-headline-sm bg-surface-container-low border border-outline-variant rounded text-on-surface focus:border-primary" type="text" value="500.00"></div><div class="flex items-center gap-2 pt-1 text-label-sm font-label-sm text-outline"><span class="">Ref (Optional):</span><input class="flex-1 py-0.5 px-2 text-label-sm bg-surface-container-lowest border border-outline-variant rounded placeholder:text-outline" placeholder="e.g. TXN-9028471" type="text" value="TXN-9028471"></div></div></div><div class="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant space-y-2"><div class="flex justify-between text-body-sm font-body-sm"><span class="text-on-surface-variant">Total Due</span><span class="font-semibold text-on-surface">1,200.00</span></div><div class="flex justify-between text-body-sm font-body-sm"><span class="text-on-surface-variant">Total Allocated</span><span class="font-semibold text-on-surface">1,200.00</span></div><div class="pt-2 border-t border-outline-variant flex items-center justify-between"><span class="text-label-md font-label-md font-bold text-on-surface">Remaining:</span><span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-label-md font-bold flex items-center gap-1"><span class="material-symbols-outlined text-body-sm" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>0.00 (Fully Allocated)</span></div></div><div class="pt-2 space-y-2"><button class="w-full py-3 px-4 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"><span class="">Confirm Sale</span><span class="material-symbols-outlined text-headline-sm" data-icon="arrow_forward">arrow_forward</span></button><div class="text-center text-label-sm font-label-sm text-outline">Records the sale and updates branch inventory.</div><div class="pt-2"><button class="w-full py-2 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-error-container hover:text-on-error-container text-on-surface rounded text-label-md font-label-md flex items-center justify-center gap-1 transition-colors"><span class="material-symbols-outlined text-body-md" data-icon="delete_sweep">delete_sweep</span>Clear Sale</button></div></div></div>
</div>
</div>
</main>
</div>


</body></html>





#Owner Dashboard



<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Gelana Inventory &amp; Sales Management System - Owner Dashboard</title>
<!-- Fonts & Icons -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "on-surface": "#161c27",
            "on-error-container": "#93000a",
            "primary-fixed-dim": "#b9c3ff",
            "on-primary-fixed-variant": "#0033c0",
            "surface-dim": "#d4daea",
            "error-container": "#ffdad6",
            "secondary-fixed-dim": "#ccc6b6",
            "outline": "#747688",
            "secondary-container": "#e6dfcf",
            "on-tertiary-fixed-variant": "#8a1c00",
            "on-secondary": "#ffffff",
            "on-tertiary": "#ffffff",
            "on-primary-container": "#d4d9ff",
            "secondary": "#625e51",
            "primary": "#0035c5",
            "primary-container": "#0047ff",
            "tertiary": "#8d1c00",
            "secondary-fixed": "#e9e2d2",
            "surface-container": "#e8eefe",
            "inverse-surface": "#2a303d",
            "surface-container-high": "#e3e8f9",
            "surface-tint": "#0046fa",
            "surface-bright": "#f9f9ff",
            "background": "#f9f9ff",
            "on-tertiary-container": "#ffd1c6",
            "surface-variant": "#dde2f3",
            "on-primary": "#ffffff",
            "inverse-primary": "#b9c3ff",
            "tertiary-fixed": "#ffdad2",
            "surface": "#f9f9ff",
            "on-secondary-fixed": "#1e1c12",
            "surface-container-lowest": "#ffffff",
            "error": "#ba1a1a",
            "outline-variant": "#c4c5da",
            "on-surface-variant": "#434657",
            "on-error": "#ffffff",
            "inverse-on-surface": "#ecf0ff",
            "on-primary-fixed": "#001257",
            "surface-container-highest": "#dde2f3",
            "surface-container-low": "#f1f3ff",
            "on-secondary-fixed-variant": "#4a473b",
            "on-secondary-container": "#666255",
            "on-tertiary-fixed": "#3d0700",
            "tertiary-container": "#b82800",
            "primary-fixed": "#dde1ff",
            "tertiary-fixed-dim": "#ffb4a2",
            "on-background": "#161c27"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "gutter": "1.25rem",
            "space-xs": "0.25rem",
            "space-sm": "0.5rem",
            "space-xl": "2rem",
            "margin-mobile": "1rem",
            "space-lg": "1.5rem",
            "margin": "2rem",
            "space-md": "1rem",
            "gutter-mobile": "0.75rem"
          },
          "fontFamily": {
            "label-lg": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      font-size: 20px;
    }
    .material-symbols-fill {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #F8FAFC;
    }
  </style>
</head>
<body class="text-on-surface antialiased bg-[#F8FAFC] min-h-screen flex">
<!-- ================= SIDEBAR NAVIGATION ================= -->
<aside class="fixed top-0 left-0 h-screen w-64 flex flex-col z-40 bg-surface-container-lowest border-r border-outline-variant select-none">
<!-- Brand Header Area -->
<div class="h-16 px-5 flex items-center gap-3 border-b border-outline-variant">
<img alt="Gelana Stationers Corporate Seal Emblem" class="h-9 w-auto object-contain rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu6Zr8Gk5HIOVg__ITLmiHzUXJ0QouEIhyHgcos1hmSV1AXS9gD-vzZW0V8M9Wu4FWIlASLLIX0ztH8jREVntCu_sJg3BB-ZGCIMXsQVbXQY1Sr74WanQPYGundY4U3fpShEdX4llbEjWn6maw7Kk0pFsM0jLSlMxngiJQtgLKDLpIK1x0_6EMWk2g5CWSnIiqga8vAfcidFbdxMw5IGFqQJEwurgccDVy-xPULvj_oJaWyC4nwF-eN_3JKYdabUuW">
</div>
<!-- Navigation Scrollable Area -->
<div class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
<!-- 1. Dashboard (ACTIVE) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container text-primary font-semibold border-l-4 border-primary transition-colors duration-150" href="#">
<span class="material-symbols-outlined material-symbols-fill text-primary">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<!-- 2. Sales -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">receipt_long</span>
<span class="text-label-md font-label-md">Sales</span>
</a>
<!-- 3. Inventory -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<!-- 4. Transfers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">local_shipping</span>
<span class="text-label-md font-label-md">Transfers</span>
<span class="ml-auto bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">category</span>
<span class="text-label-md font-label-md">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">corporate_fare</span>
<span class="text-label-md font-label-md">Suppliers</span>
</a>
<!-- 7. Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">event_available</span>
<span class="text-label-md font-label-md">Daily Closing</span>
<span class="ml-auto w-2 h-2 rounded-full bg-red-500"></span>
</a>
<!-- 8. Reports -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="text-label-md font-label-md">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">storefront</span>
<span class="text-label-md font-label-md">Users &amp; Branches</span>
</a>
<div class="pt-4 mt-2 border-t border-outline-variant/60"></div>
<!-- 10. Notifications -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">notifications</span>
<span class="text-label-md font-label-md">Notifications</span>
<span class="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">4</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
</div>
<!-- Quick System Snapshot at Sidebar Bottom -->
<div class="p-3 m-3 bg-[#FFF8E7] rounded-lg border border-[#E5DCBE]"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-secondary">3 Branches</span>
<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Operational</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface mt-1 font-medium">Gelana Network Hub</p></div>
</aside>
<!-- ================= MAIN WRAPPER ================= -->
<div class="flex-1 ml-64 flex flex-col min-w-0">
<!-- Top Navigation Bar -->
<header class="sticky top-0 z-30 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8">
<!-- Left side: Branch Selector & Business Date -->
<div class="flex items-center gap-4">
<!-- Branch Selector -->
<div class="relative">
<label class="sr-only" for="branch-selector">Select Retail Branch</label>
<div class="flex items-center bg-white border border-[#E2E7EE] rounded px-3 py-1.5 text-on-surface hover:border-primary transition-colors">
<span class="material-symbols-outlined text-[#64748B] text-lg mr-2">store</span>
<select class="bg-transparent text-label-md font-label-md font-semibold text-on-surface focus:outline-none border-none pr-8 cursor-pointer p-0" id="branch-selector"><option selected="" value="all">All Branches</option>
<option value="b1">Branch 1</option>
<option value="b2">Branch 2</option>
<option value="b3">Branch 3</option></select>
</div>
</div>
<div class="h-4 w-px bg-outline-variant"></div>
<!-- Business Date Badge -->
<div class="flex items-center gap-1.5 text-label-md font-label-md text-on-surface-variant bg-[#F6F8FB] px-3 py-1.5 rounded border border-[#E2E7EE]">
<span class="material-symbols-outlined text-base text-[#64748B]">calendar_today</span>
<span class="">Today — Oct 24, 2025</span>
</div>
</div>
<!-- Right side: Sync Pill, Notifications & Owner Profile -->
<div class="flex items-center gap-4">
<!-- Sync Status Pill -->
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF8F1] border border-[#A7E2C3] text-[#0D824C]">
<span class="w-2 h-2 rounded-full bg-[#0D824C] animate-pulse"></span>
<span class="text-label-sm font-label-sm font-semibold">Online — All synced</span>
</div>
<!-- Notifications Bell -->
<button aria-label="Notifications" class="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">4</span>
</button>
<div class="h-6 w-px bg-outline-variant"></div>
<!-- Owner Profile -->
<div class="flex items-center gap-2.5">
<div class="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center ring-2 ring-primary/20">
            AG
          </div>
<div class="flex flex-col">
<span class="text-label-md font-label-md font-bold text-on-surface leading-tight">Abebe G.</span>
<span class="text-label-sm font-label-sm text-[#64748B]">Owner</span>
</div>
<span class="material-symbols-outlined text-base text-[#64748B] ml-1">expand_more</span>
</div>
</div>
</header>
<!-- ================= MAIN CONTENT ================= -->
<main class="flex-1 p-8 space-y-6 max-w-7xl w-full">
<!-- 1. Page Header -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#E2E7EE]/70"><div>
<h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">Owner Dashboard</h1>
<p class="text-body-md font-body-md text-on-surface-variant mt-0.5">Business overview across all branches</p>
</div></div>
<!-- 2. Level 1: "Action Required" / Needs Attention Banner & Cards -->
<section class="space-y-3"><div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-amber-600">emergency_home</span>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Action Required — Branch Review</h2>
</div>
<span class="text-label-sm font-label-sm text-on-surface-variant font-medium">3 Items Requiring Attention</span>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
<!-- Critical: Closing Discrepancy -->
<div class="bg-white rounded-lg border-l-4 border-l-red-500 border border-[#E2E7EE] p-4 shadow-[0_1px_3px_rgba(30,36,48,0.04)] flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-2">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEE4E2] text-[#D92D20] tracking-wide">
CRITICAL DISCREPANCY
</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">Today 18:15</span>
</div>
<h3 class="text-label-lg font-label-lg text-on-surface font-bold">Daily Closing Discrepancy — Branch 2</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
Expected: <span class="font-semibold text-on-surface">4,500.00</span> | Actual: <span class="font-semibold text-on-surface">4,300.00</span>
</p>
<div class="mt-2 text-label-md font-label-md text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center justify-between">
<span class="">Variance (Cash Shortage):</span>
<span class="">-200.00</span>
</div>
</div>
<div class="mt-4 pt-3 border-t border-[#E2E7EE] flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">Branch 2</span>
<a class="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline" href="#">
Review Closing <span class="material-symbols-outlined text-base">arrow_forward</span>
</a>
</div>
</div>
<!-- Important: Transfer Requests -->
<div class="bg-white rounded-lg border-l-4 border-l-amber-500 border border-[#E2E7EE] p-4 shadow-[0_1px_3px_rgba(30,36,48,0.04)] flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-2">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF9C3] text-[#A16207] tracking-wide">
TRANSFER APPROVAL
</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">3 Awaiting</span>
</div>
<h3 class="text-label-lg font-label-lg text-on-surface font-bold">3 Inter-Branch Stock Transfers</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
Highest priority: <span class="font-semibold text-on-surface">TRF-000018</span>
</p>
<div class="mt-2 text-body-sm font-body-sm bg-[#F6F8FB] p-2 rounded border border-[#E2E7EE]">
<div class="font-medium text-on-surface">Branch 1 → Branch 3</div>
<div class="text-secondary text-xs">Double A A4 Paper (80 GSM) • 40 Reams</div>
</div>
</div>
<div class="mt-4 pt-3 border-t border-[#E2E7EE] flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">Stock Request</span>
<a class="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline" href="#">
Review Transfers <span class="material-symbols-outlined text-base">arrow_forward</span>
</a>
</div>
</div>
<!-- Important: Inventory Thresholds -->
<div class="bg-white rounded-lg border-l-4 border-l-blue-600 border border-[#E2E7EE] p-4 shadow-[0_1px_3px_rgba(30,36,48,0.04)] flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-2">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8EEFE] text-primary tracking-wide">
STOCK THRESHOLDS
</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">Live Alert</span>
</div>
<h3 class="text-label-lg font-label-lg text-on-surface font-bold">12 Critical SKU Alerts</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
Products currently below branch-specific minimum stock levels.
</p>
<div class="mt-2 grid grid-cols-2 gap-2 text-center">
<div class="bg-amber-50 border border-amber-200 rounded p-1.5">
<span class="text-headline-sm font-headline-sm text-amber-800 block">8</span>
<span class="text-[11px] font-semibold text-amber-700">Low Stock SKUs</span>
</div>
<div class="bg-red-50 border border-red-200 rounded p-1.5">
<span class="text-headline-sm font-headline-sm text-red-700 block">4</span>
<span class="text-[11px] font-semibold text-red-700">Out of Stock</span>
</div>
</div>
</div>
<div class="mt-4 pt-3 border-t border-[#E2E7EE] flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">Branch 2 &amp; 3 Impacted</span>
<a class="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline" href="#">
View Inventory <span class="material-symbols-outlined text-base">arrow_forward</span>
</a>
</div>
</div>
</div></section>
<!-- 3. Level 2: Top KPI Metrics (Strictly 4 Operational Cards) -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><!-- Metric 1: Today's Recorded Sales -->
<div class="bg-white rounded-lg border border-[#E2E7EE] p-5 shadow-[0_1px_3px_rgba(30,36,48,0.04)]">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md uppercase tracking-wider text-[#64748B]">Today's Recorded Sales</span>
<span class="p-1.5 bg-[#EBF8F1] text-[#0D824C] rounded">
<span class="material-symbols-outlined text-lg">trending_up</span>
</span>
</div>
<div class="mt-3 flex items-baseline gap-2">
<span class="text-headline-xl font-headline-xl text-on-surface tracking-tight">14,850.00</span>
</div>
<div class="mt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-[#F1F3FF] pt-2">
<span class="text-on-surface-variant">Completed Transactions</span>
<span class="font-bold text-on-surface bg-[#F1F3FF] px-2 py-0.5 rounded text-xs">54 sales</span>
</div>
</div>
<!-- Metric 2: Current Inventory Valuation -->
<div class="bg-white rounded-lg border border-[#E2E7EE] p-5 shadow-[0_1px_3px_rgba(30,36,48,0.04)]">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md uppercase tracking-wider text-[#64748B]">Inventory Valuation</span>
<span class="p-1.5 bg-[#E8EEFE] text-primary rounded">
<span class="material-symbols-outlined text-lg">account_balance_wallet</span>
</span>
</div>
<div class="mt-3 flex items-baseline gap-2">
<span class="text-headline-xl font-headline-xl text-on-surface tracking-tight">482,300.00</span>
</div>
<div class="mt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-[#F1F3FF] pt-2">
<span class="text-on-surface-variant">Valuation Basis</span>
<span class="text-[11px] font-semibold text-secondary">Weighted Avg Cost</span>
</div>
</div>
<!-- Metric 3: Low Stock Items -->
<div class="bg-white rounded-lg border border-[#E2E7EE] p-5 shadow-[0_1px_3px_rgba(30,36,48,0.04)]">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md uppercase tracking-wider text-[#64748B]">Low Stock Items</span>
<span class="p-1.5 bg-[#FEF9C3] text-[#A16207] rounded">
<span class="material-symbols-outlined text-lg">warning</span>
</span>
</div>
<div class="mt-3 flex items-baseline gap-2">
<span class="text-headline-xl font-headline-xl text-on-surface tracking-tight">8</span>
<span class="text-label-sm font-label-sm text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Below Min Level</span>
</div>
<div class="mt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-[#F1F3FF] pt-2">
<span class="text-on-surface-variant">Threshold Status</span>
<span class="text-xs font-semibold text-amber-800">Branch 2 &amp; 3</span>
</div>
</div>
<!-- Metric 4: Out of Stock Items -->
<div class="bg-white rounded-lg border border-[#E2E7EE] p-5 shadow-[0_1px_3px_rgba(30,36,48,0.04)]">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md uppercase tracking-wider text-[#64748B]">Out of Stock</span>
<span class="p-1.5 bg-[#FEE4E2] text-[#D92D20] rounded">
<span class="material-symbols-outlined text-lg">error_outline</span>
</span>
</div>
<div class="mt-3 flex items-baseline gap-2">
<span class="text-headline-xl font-headline-xl text-red-600 tracking-tight">4</span>
<span class="text-label-sm font-label-sm text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Zero Units</span>
</div>
<div class="mt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-[#F1F3FF] pt-2">
<span class="text-on-surface-variant">Zero Sellable Stock</span>
<span class="text-xs font-bold text-red-600">Branch 3</span>
</div>
</div></section>
<!-- 4. Level 3: Multi-Branch Performance Comparison -->
<section class="bg-white rounded-lg border border-[#E2E7EE] shadow-[0_1px_3px_rgba(30,36,48,0.04)] overflow-hidden">
<div class="px-6 py-4 border-b border-[#E2E7EE] flex items-center justify-between">
<div>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Multi-Branch Performance Overview</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Real-time consolidation of retail floor sales, closing records, and stock integrity</p>
</div>
<span class="text-label-sm font-label-sm text-[#64748B] bg-[#F6F8FB] px-3 py-1 rounded border border-[#E2E7EE]">3 Operating Branches</span>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-[#E2E7EE] bg-[#F8FAFC]">
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider">Branch Name</th>
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider text-right">Today's Sales</th>
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider text-center">Transactions</th>
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider">Stock Status</th>
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider">Daily Closing Status</th>
<th class="py-3 px-6 text-label-md font-label-md text-[#64748B] uppercase tracking-wider text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-[#E2E7EE] text-body-md font-body-md"><!-- Branch 1 -->
<tr class="hover:bg-[#F8FAFC] transition-colors">
<td class="py-4 px-6 font-semibold text-on-surface">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
<span class="">Branch 1</span>
</div>
</td>
<td class="py-4 px-6 text-right font-bold text-on-surface font-mono">6,420.00</td>
<td class="py-4 px-6 text-center text-on-surface-variant">24 sales</td>
<td class="py-4 px-6">
<span class="text-xs text-secondary font-medium">0 Low / 0 Out</span>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#F2F4F7] text-[#475467] border border-[#CBD5E1]">
Not Submitted
</span>
</td>
<td class="py-4 px-6 text-right">
<a class="text-primary hover:text-[#0039CC] text-label-md font-label-md font-semibold" href="#">View Detail →</a>
</td>
</tr>
<!-- Branch 2 -->
<tr class="bg-[#FFF8E7]/40 hover:bg-[#FFF8E7]/70 transition-colors border-l-2 border-l-red-500">
<td class="py-4 px-6 font-semibold text-on-surface">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
<span class="">Branch 2</span>
</div>
</td>
<td class="py-4 px-6 text-right font-bold text-on-surface font-mono">4,300.00</td>
<td class="py-4 px-6 text-center text-on-surface-variant">18 sales</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF9C3] text-[#A16207]">
5 Low Stock
</span>
</td>
<td class="py-4 px-6">
<div class="flex items-center gap-2">
<span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
Submitted — Awaiting Approval (Discrepancy: -200.00)
</span>
</div>
</td>
<td class="py-4 px-6 text-right">
<a class="text-red-600 hover:text-red-800 text-label-md font-label-md font-bold" href="#">Review Closing →</a>
</td>
</tr>
<!-- Branch 3 -->
<tr class="hover:bg-[#F8FAFC] transition-colors">
<td class="py-4 px-6 font-semibold text-on-surface">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
<span class="">Branch 3</span>
</div>
</td>
<td class="py-4 px-6 text-right font-bold text-on-surface font-mono">4,130.00</td>
<td class="py-4 px-6 text-center text-on-surface-variant">12 sales</td>
<td class="py-4 px-6">
<div class="flex items-center gap-1.5">
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF9C3] text-[#A16207]">
3 Low
</span>
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEE4E2] text-[#D92D20]">
4 Out
</span>
</div>
</td>
<td class="py-4 px-6">
<span class="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#F2F4F7] text-[#475467] border border-[#CBD5E1]">
Not Submitted
</span>
</td>
<td class="py-4 px-6 text-right">
<a class="text-primary hover:text-[#0039CC] text-label-md font-label-md font-semibold" href="#">View Detail →</a>
</td>
</tr></tbody>
</table>
</div>
</section>
<!-- 5. Level 4: Two-Column Operations Layout (Sales Trend + Recent Business Activity) -->
<section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- Left Column (7/12): Hourly Sales Activity Overview -->
<div class="lg:col-span-7 bg-white rounded-lg border border-[#E2E7EE] p-6 shadow-[0_1px_3px_rgba(30,36,48,0.04)] flex flex-col justify-between"><div>
<div class="flex items-center justify-between pb-3 border-b border-[#E2E7EE]">
<div>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Sales Trend</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Sales volume trend across branches</p>
</div>
<div class="flex items-center gap-1.5 text-xs">
<button class="px-2.5 py-1 rounded font-semibold bg-primary text-white">Today</button>
<button class="px-2.5 py-1 rounded text-[#64748B] hover:text-on-surface bg-[#F6F8FB] border border-[#E2E7EE]">Last 7 Days</button>
<button class="px-2.5 py-1 rounded text-[#64748B] hover:text-on-surface bg-[#F6F8FB] border border-[#E2E7EE]">This Month</button>
</div>
</div>
<!-- Stylized Operational Chart Grid -->
<div class="mt-6 pt-2">
<!-- Y Axis & Plot Surface -->
<div class="relative h-56 flex items-end justify-between pt-6 px-2 border-b border-[#CBD5E1]">
<!-- Horizontal guideline lines -->
<div class="absolute inset-x-0 top-6 border-t border-dashed border-[#E2E7EE] text-[10px] text-[#94A3B8] pr-2 text-right">3,000</div>
<div class="absolute inset-x-0 top-20 border-t border-dashed border-[#E2E7EE] text-[10px] text-[#94A3B8] pr-2 text-right">2,000</div>
<div class="absolute inset-x-0 top-36 border-t border-dashed border-[#E2E7EE] text-[10px] text-[#94A3B8] pr-2 text-right">1,000</div>
<!-- Interval 1 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#E8EEFE] rounded-t hover:bg-primary transition-colors" style="height: 48px;" title="Period 1: 650.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">09:00</span>
</div>
<!-- Interval 2 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0047FF] rounded-t shadow-sm" style="height: 110px;" title="Period 2: 1,450.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">10:00</span>
</div>
<!-- Interval 3 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0047FF] rounded-t shadow-sm" style="height: 140px;" title="Period 3: 1,980.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">11:00</span>
</div>
<!-- Interval 4 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0035C5] rounded-t shadow-sm" style="height: 190px;" title="Period 4: 2,750.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">12:00</span>
</div>
<!-- Interval 5 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#E8EEFE] rounded-t hover:bg-primary transition-colors" style="height: 60px;" title="Period 5: 820.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">13:00</span>
</div>
<!-- Interval 6 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0047FF] rounded-t shadow-sm" style="height: 130px;" title="Period 6: 1,840.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">14:00</span>
</div>
<!-- Interval 7 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0047FF] rounded-t shadow-sm" style="height: 155px;" title="Period 7: 2,120.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">15:00</span>
</div>
<!-- Interval 8 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#0047FF] rounded-t shadow-sm" style="height: 165px;" title="Period 8: 2,310.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">16:00</span>
</div>
<!-- Interval 9 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-5 bg-[#E8EEFE] rounded-t hover:bg-primary transition-colors" style="height: 72px;" title="Period 9: 930.00"></div>
<span class="text-[11px] font-medium text-[#64748B]">17:00</span>
</div>
<!-- Interval 10 -->
<div class="relative flex flex-col items-center gap-1.5 z-10 w-10">
<div class="w-2.5 border-t-2 border-primary" style="height: 0px;" title="Period 10"></div>
<span class="text-[11px] font-medium text-[#64748B]">18:00</span>
</div>
</div>
</div>
</div>
<div class="mt-6 pt-3 border-t border-[#E2E7EE] flex items-center justify-between text-body-sm font-body-sm text-[#64748B]">
<span class="">Consolidated sales volume over selected period</span>
<span class="font-semibold text-primary">Real-time Sync Active</span>
</div></div>
<!-- Right Column (5/12): Recent Business Activity Log -->
<div class="lg:col-span-5 bg-white rounded-lg border border-[#E2E7EE] p-6 shadow-[0_1px_3px_rgba(30,36,48,0.04)] flex flex-col justify-between"><div>
<div class="flex items-center justify-between pb-3 border-b border-[#E2E7EE]">
<div>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Recent Business Activity</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Recent important activity across branches</p>
</div>
<span class="p-1 rounded bg-[#F8FAFC] text-[#64748B]">
<span class="material-symbols-outlined text-base">history</span>
</span>
</div>
<!-- Operational Activity Items List -->
<div class="mt-4 space-y-3.5">
<!-- 1. Sale Recorded -->
<div class="flex items-start gap-3 pb-3 border-b border-[#F1F3FF]">
<div class="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-base">point_of_sale</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between">
<p class="text-label-md font-label-md text-on-surface font-bold">SAL-000124 recorded</p>
<span class="text-xs font-mono font-bold text-on-surface">1,200.00</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant">Branch 1 • 14 mins ago</p>
</div>
</div>
<!-- 2. Stock Received -->
<div class="flex items-start gap-3 pb-3 border-b border-[#F1F3FF]">
<div class="w-8 h-8 rounded bg-blue-50 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-base">move_to_inbox</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between">
<p class="text-label-md font-label-md text-on-surface font-bold">REC-000045 received</p>
<span class="text-[11px] font-semibold text-primary bg-blue-50 px-1.5 py-0.5 rounded">100 Reams</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant">Double A Paper • Branch 1 • 32 mins ago</p>
</div>
</div>
<!-- 3. Transfer Requested -->
<div class="flex items-start gap-3 pb-3 border-b border-[#F1F3FF]">
<div class="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-base">swap_horiz</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between">
<p class="text-label-md font-label-md text-on-surface font-bold">TRF-000018 requested</p>
<span class="text-[11px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">Pending Owner</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant">Branch 1 → Branch 3 (40 Reams) • 1 hr ago</p>
</div>
</div>
<!-- 4. Closing Submitted -->
<div class="flex items-start gap-3 pb-3 border-b border-[#F1F3FF]">
<div class="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-base">fact_check</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between">
<p class="text-label-md font-label-md text-on-surface font-bold">CLS-000031 submitted</p>
<span class="text-xs font-mono font-bold text-red-600">4,300.00 cash</span>
</div>
<p class="text-body-sm font-body-sm text-red-600 font-medium">Branch 2 • -200.00 discrepancy flagged • 18:15</p>
</div>
</div>
<!-- 5. Return Recorded -->
<div class="flex items-start gap-3">
<div class="w-8 h-8 rounded bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-base">assignment_return</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between">
<p class="text-label-md font-label-md text-on-surface font-bold">RET-000007 recorded</p>
<span class="text-[11px] font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">Defective</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant">Branch 3 • Heavy Duty Binder • 2 hrs ago</p>
</div>
</div>
</div>
</div>
<!-- Activity Footer -->
<div class="mt-4 pt-3 border-t border-[#E2E7EE] text-center">
<a class="text-label-md font-label-md font-semibold text-primary hover:underline inline-flex items-center gap-1" href="#">
<span class="">View Audit Log</span>
<span class="material-symbols-outlined text-sm">open_in_new</span>
</a>
</div></div>
</section>
</main>
</div>


</body></html>




#Sales Management


<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Current Inventory — Gelana Inventory &amp; Sales Management</title>
<!-- Plus Jakarta Sans Font -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS CDN with plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "surface-container": "#e8eefe",
            "secondary-container": "#e6dfcf",
            "tertiary": "#8d1c00",
            "primary-fixed": "#dde1ff",
            "error-container": "#ffdad6",
            "on-tertiary-fixed-variant": "#8a1c00",
            "surface-bright": "#f9f9ff",
            "on-surface": "#161c27",
            "on-primary": "#ffffff",
            "error": "#ba1a1a",
            "on-tertiary-container": "#ffd1c6",
            "outline-variant": "#c4c5da",
            "tertiary-fixed-dim": "#ffb4a2",
            "on-primary-container": "#d4d9ff",
            "surface-tint": "#0046fa",
            "on-primary-fixed": "#001257",
            "secondary-fixed-dim": "#ccc6b6",
            "primary-fixed-dim": "#b9c3ff",
            "on-primary-fixed-variant": "#0033c0",
            "primary": "#0035c5",
            "tertiary-container": "#b82800",
            "on-secondary-fixed-variant": "#4a473b",
            "outline": "#747688",
            "surface-variant": "#dde2f3",
            "inverse-primary": "#b9c3ff",
            "secondary-fixed": "#e9e2d2",
            "on-secondary-fixed": "#1e1c12",
            "on-tertiary-fixed": "#3d0700",
            "inverse-on-surface": "#ecf0ff",
            "primary-container": "#0047ff",
            "tertiary-fixed": "#ffdad2",
            "on-surface-variant": "#434657",
            "on-tertiary": "#ffffff",
            "on-error": "#ffffff",
            "surface-container-low": "#f1f3ff",
            "secondary": "#625e51",
            "on-error-container": "#93000a",
            "inverse-surface": "#2a303d",
            "surface": "#f9f9ff",
            "background": "#f9f9ff",
            "surface-container-highest": "#dde2f3",
            "surface-container-lowest": "#ffffff",
            "surface-container-high": "#e3e8f9",
            "surface-dim": "#d4daea",
            "on-secondary-container": "#666255",
            "on-secondary": "#ffffff",
            "on-background": "#161c27"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "space-xs": "0.25rem",
            "space-xl": "2rem",
            "space-lg": "1.5rem",
            "margin": "2rem",
            "space-sm": "0.5rem",
            "gutter-mobile": "0.75rem",
            "margin-mobile": "1rem",
            "space-md": "1rem",
            "gutter": "1.25rem"
          },
          "fontFamily": {
            "label-sm": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      vertical-align: middle;
      display: inline-block;
      line-height: 1;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f3ff;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #c4c5da;
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-background text-on-surface antialiased font-body-md text-body-md min-h-screen flex flex-col">
<!-- PERSISTENT APP SHELL: SIDEBAR NAVIGATION -->
<aside class="fixed top-0 left-0 h-screen w-64 flex flex-col z-40 bg-surface-container-lowest border-r border-outline-variant">
<div class="w-64 h-full flex flex-col justify-between py-4 px-3">
<!-- Logo and Header -->
<div class="flex flex-col gap-5">
<div class="flex items-center gap-3 px-2 py-1">
<img alt="Gelana Stationers Corporate Seal Emblem" class="w-10 h-10 object-contain rounded-lg border border-outline-variant/60 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2jkfdADuXEpmg_Ockc_0XcsYcAUGZFsNwTc-cs0UR18jxzQTgjtbriLoexMj7GdSIXIZObRxGgosyOHvNpjVQDIZBlOA_S0VqIz2IwjbWILzbT4W-HIhLpvvg4v11fsea9KRTurVAhxm4kYx8tCmC8ATisBmNoqqMVev7yREkpzIC6JpR-U_cot4IgvnfdGbQjfPFpMdFf_wlN03s6ozkVPdGJfYIrIfRe0f5uVgqGiX8yOFf7CQWdtpegt83euJA">
<div class="flex flex-col">
<span class="text-headline-sm font-headline-sm font-bold text-on-surface tracking-tight leading-none">Gelana</span>
<span class="text-label-sm font-label-sm text-outline mt-1 font-medium">Inventory &amp; Sales Management</span>
</div>
</div>
<!-- Section Label -->
<div class="px-2">
<div class="text-[10px] uppercase font-bold tracking-wider text-outline px-1">Owner Workspace</div>
</div>
<!-- Navigation Tabs -->
<nav class="flex flex-col gap-1">
<!-- Inactive Tab: Dashboard -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<!-- Inactive Tab: Sales -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">receipt_long</span>
<span class="text-label-md font-label-md">Sales</span>
</a>
<!-- ACTIVE TAB: Inventory (Current Screen) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-container text-primary font-semibold border-l-4 border-primary transition-colors duration-150 cursor-pointer shadow-sm" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<!-- Inactive Tab: Transfers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">swap_horiz</span>
<span class="text-label-md font-label-md">Transfers</span>
</a>
<!-- Inactive Tab: Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">category</span>
<span class="text-label-md font-label-md">Products &amp; Categories</span>
</a>
<!-- Inactive Tab: Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">local_shipping</span>
<span class="text-label-md font-label-md">Suppliers</span>
</a>
<!-- Inactive Tab: Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">lock_clock</span>
<span class="text-label-md font-label-md">Daily Closing</span>
</a>
<!-- Inactive Tab: Reports -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">analytics</span>
<span class="text-label-md font-label-md">Reports</span>
</a>
<!-- Inactive Tab: Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">corporate_fare</span>
<span class="text-label-md font-label-md">Users &amp; Branches</span>
</a>
<!-- Inactive Tab: Notifications -->
<a class="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[20px]">notifications</span>
<span class="text-label-md font-label-md">Notifications</span>
</div>
<span class="bg-error text-on-error font-label-sm text-[10px] px-1.5 py-0.5 rounded-full">4</span>
</a>
</nav>
</div>
<!-- Footer Navigation Items & Fast Audit CTA -->
<div class="flex flex-col gap-2 pt-3 border-t border-outline-variant/60"><a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a></div>
</div>
</aside>
<!-- MAIN CONTAINER (OFFSET BY SIDEBAR) -->
<div class="ml-64 flex flex-col min-h-screen">
<!-- TOP HEADER / NAV BAR -->
<header class="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant px-8 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(30,36,48,0.03)]">
<!-- Left side: Branch Scope & Operational Date Indicator -->
<div class="flex items-center gap-6">
<div class="flex items-center gap-2 text-on-surface">
<span class="material-symbols-outlined text-outline text-[20px]">store</span>
<label class="text-label-sm font-label-sm text-outline" for="branch-scope">Scope:</label>
<div class="relative inline-block">
<select class="bg-surface-container-low text-on-surface text-label-md font-label-md py-1.5 pl-3 pr-8 rounded-lg border border-outline-variant/80 focus:border-primary focus:ring-0 cursor-pointer appearance-none" id="branch-scope">
<option selected="">All Branches</option>
<option>Branch 1 (Central Plaza)</option>
<option>Branch 2 (Bole Subcity)</option>
<option>Branch 3 (Piazza Outlet)</option>
</select>
<span class="material-symbols-outlined text-[16px] text-outline absolute right-2 top-2.5 pointer-events-none">expand_more</span>
</div>
</div>
<div class="h-4 w-px bg-outline-variant"></div>
<div class="flex items-center gap-2 text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
<span class="">Today — Oct 24, 2025</span>
</div>
</div>
<!-- Right side: System Health & Owner Profile -->
<div class="flex items-center gap-4">
<!-- Sync Indicator -->
<div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EBF8F1] border border-[#BCE8D1] text-[#0D824C] text-label-sm font-label-sm">
<span class="w-2 h-2 rounded-full bg-[#0D824C] animate-pulse"></span>
<span class="">Online — All synced</span>
</div>
<!-- Trailing action icons -->
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors" title="Station Synchronization">
<span class="material-symbols-outlined text-[20px]">sync</span>
</button>
<!-- Notification bell with badge -->
<button class="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
<span class="material-symbols-outlined text-[20px]">notifications</span>
<span class="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center leading-none">4</span>
</button>
<div class="h-5 w-px bg-outline-variant"></div>
<!-- Owner Identity Badge -->
<div class="flex items-center gap-2.5 pl-1">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-label-sm border border-primary-fixed">
            AG
          </div>
<div class="flex flex-col text-left">
<span class="text-label-md font-label-md text-on-surface font-semibold leading-tight">Abebe G.</span>
<span class="text-label-sm font-label-sm text-outline">Owner Account</span>
</div>
<span class="material-symbols-outlined text-outline text-[18px]">expand_more</span>
</div>
</div>
</header>
<!-- MAIN OPERATIONAL VIEW CANVAS -->
<main class="flex-1 p-8 space-y-6">
<!-- PAGE TITLE & HIGH LEVEL ACTIONS -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4"><div>
<div class="flex items-center gap-2.5">
<h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">Current Inventory</h1>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1">View current stock levels, availability, and branch-specific inventory across branches.</p>
</div></div>
<!-- TOP CONTEXTUAL SUMMARY KPI CARDS (Restrained Bento-Row) -->
<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
<!-- 1. Total Tracked Records -->
<div class="bg-surface-container-lowest border border-outline-variant/80 p-3.5 rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] flex flex-col justify-between"><span class="text-label-sm font-label-sm text-outline uppercase tracking-wider">Total Products</span>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-on-surface leading-tight font-bold">146 Products</div>
<div class="text-[11px] text-on-surface-variant mt-0.5">Tracked inventory items</div>
</div></div>
<!-- 2. In Stock Positions -->
<div class="bg-surface-container-lowest border border-outline-variant/80 p-3.5 rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] flex flex-col justify-between"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-[#0D824C] uppercase tracking-wider font-semibold">In Stock</span>
<span class="w-2 h-2 rounded-full bg-[#0D824C]"></span>
</div>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-on-surface leading-tight font-bold">131 Products</div>
<div class="text-[11px] text-[#0D824C] mt-0.5">Above minimum threshold</div>
</div></div>
<!-- 3. Low Stock Warning -->
<div class="bg-surface-container-lowest border border-outline-variant/80 p-3.5 rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] flex flex-col justify-between"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-amber-700 uppercase tracking-wider font-semibold">Low Stock</span>
<span class="material-symbols-outlined text-[16px] text-amber-600">warning</span>
</div>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-amber-900 leading-tight font-bold">8 Products</div>
<div class="text-[11px] text-amber-700 mt-0.5">At or below branch minimum</div>
</div></div>
<!-- 4. Out of Stock -->
<div class="bg-surface-container-lowest border border-outline-variant/80 p-3.5 rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] flex flex-col justify-between"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-error uppercase tracking-wider font-semibold">Out of Stock</span>
<span class="w-2 h-2 rounded-full bg-error"></span>
</div>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-error leading-tight font-bold">7 Products</div>
<div class="text-[11px] text-outline mt-0.5">Zero sellable units</div>
</div></div>
<!-- 5. Damaged Stock -->
<div class="bg-surface-container-lowest border border-outline-variant/80 p-3.5 rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] flex flex-col justify-between"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-purple-700 uppercase tracking-wider font-semibold">Damaged Stock</span>
<span class="material-symbols-outlined text-[16px] text-purple-600">assignment_late</span>
</div>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-on-surface leading-tight font-bold">18 Units</div>
<div class="text-[11px] text-on-surface-variant mt-0.5">Segregated non-sellable</div>
</div></div>
<!-- 6. Owner-only Valuation Card (Warm White accent system) -->
<div class="bg-[#FFF8E7] border border-[#E5DCBE] p-3.5 rounded-lg shadow-sm flex flex-col justify-between"><div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm text-[#4a473b] uppercase tracking-wider font-bold">Valuation (WAC)</span>
<span class="material-symbols-outlined text-[16px] text-primary">analytics</span>
</div>
<div class="mt-2">
<div class="text-headline-md font-headline-md text-[#1E2430] leading-tight font-bold">ETB 482,300.00</div>
<div class="text-[11px] text-[#666255] mt-0.5">Owner Cost Valuation</div>
</div></div>
</div>
<!-- SEARCH & OPERATIONAL FILTER TOOLBAR -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-[0_1px_3px_rgba(30,36,48,0.02)] space-y-3"><div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
<div class="lg:col-span-5 relative">
<span class="material-symbols-outlined text-[18px] text-outline absolute left-3 top-2.5">search</span>
<input class="w-full bg-surface-container-low/70 border border-outline-variant/80 rounded-lg pl-9 pr-4 py-2 text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 outline-none transition-all" placeholder="Search by product name or SKU..." type="text" value="">
</div>
<div class="lg:col-span-2">
<select class="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:border-primary outline-none cursor-pointer">
<option>All Branches</option>
<option>Branch 1</option>
<option>Branch 2</option>
<option>Branch 3</option>
</select>
</div>
<div class="lg:col-span-2">
<select class="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:border-primary outline-none cursor-pointer">
<option>All Categories</option>
<option>Paper &amp; Notebooks</option>
<option>Writing Instruments</option>
<option>Office Essentials</option>
<option>Art Supplies</option>
<option>Binding &amp; Filing</option>
</select>
</div>
<div class="lg:col-span-2">
<select class="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface focus:border-primary outline-none cursor-pointer">
<option>All Brands</option>
<option>Double A</option>
<option>Bic</option>
<option>Kangaro</option>
<option>Deli</option>
<option>Faber-Castell</option>
</select>
</div>
<div class="lg:col-span-1">
<select class="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-lg px-2.5 py-2 text-label-md font-label-md text-on-surface focus:border-primary outline-none cursor-pointer">
<option>All Statuses</option>
<option>In Stock</option>
<option>Low Stock</option>
<option>Out of Stock</option>
<option>Damaged</option>
</select>
</div>
</div>
<div class="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-label-sm font-label-sm text-outline">
<div class="flex items-center gap-2">
<span class="">Active Filters:</span>
<span class="text-on-surface-variant font-medium">None (Showing all inventory)</span>
</div>
<div class="font-medium text-on-surface-variant">
Showing <strong class="text-on-surface font-semibold">1–8</strong> of 146 inventory records
</div>
</div></div>
<!-- MAIN OPERATIONAL INVENTORY TABLE WITH SLIDE-OVER DRAWER INTEGRATED PREVIEW -->
<div class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0_1px_3px_rgba(30,36,48,0.03)] overflow-hidden">
<div class="overflow-x-auto custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low/60 border-b border-outline-variant text-label-md font-label-md text-on-surface-variant select-none">
<th class="py-3.5 px-5 uppercase text-[11px] font-bold text-outline">Product &amp; Brand</th>
<th class="py-3.5 px-4 uppercase text-[11px] font-bold text-outline">SKU</th>
<th class="py-3.5 px-4 uppercase text-[11px] font-bold text-outline">Category</th>
<th class="py-3.5 px-4 uppercase text-[11px] font-bold text-outline">Branch</th>
<th class="py-3.5 px-4 text-right uppercase text-[11px] font-bold text-outline">Available Stock</th>
<th class="py-3.5 px-4 text-right uppercase text-[11px] font-bold text-outline">Minimum Stock</th>
<th class="py-3.5 px-4 text-center uppercase text-[11px] font-bold text-outline">Status</th>
<th class="py-3.5 px-4 text-right uppercase text-[11px] font-bold text-outline">Selling Price</th>
<th class="py-3.5 px-5 text-center uppercase text-[11px] font-bold text-outline">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/60 text-body-sm font-body-sm text-on-surface">
<!-- Row 1: Double A - Branch 1 -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Double A A4 Paper 80gsm</div>
<div class="text-[11px] text-outline font-medium">Double A</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-PAP-001</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Paper &amp; Notebooks</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 1</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface text-[13px]">120 Reams</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">20 Reams</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#EBF8F1] text-[#0D824C] border border-[#BCE8D1]">
In Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
250.00 <span class="text-[11px] font-normal text-outline">/ Ream</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 2: Double A - Branch 2 (Low Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Double A A4 Paper 80gsm</div>
<div class="text-[11px] text-outline font-medium">Double A</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-PAP-001</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Paper &amp; Notebooks</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 2</td>
<td class="py-3.5 px-4 text-right font-bold text-amber-900 text-[13px]">8 Reams</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">15 Reams</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]">
<span class="material-symbols-outlined text-[13px]">warning</span>
Low Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
250.00 <span class="text-[11px] font-normal text-outline">/ Ream</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 3: Double A - Branch 3 (Out of Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Double A A4 Paper 80gsm</div>
<div class="text-[11px] text-outline font-medium">Double A</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-PAP-001</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Paper &amp; Notebooks</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 3</td>
<td class="py-3.5 px-4 text-right font-bold text-error text-[13px]">0 Reams</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">10 Reams</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#FEE4E2] text-[#D92D20] border border-[#FECDCA]">
Out of Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
250.00 <span class="text-[11px] font-normal text-outline">/ Ream</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 4: Bic Cristal - Branch 1 (In Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Bic Cristal Medium Pen - Blue</div>
<div class="text-[11px] text-outline font-medium">Bic</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-WRI-044</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Writing Instruments</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 1</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface text-[13px]">180 Pcs</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">50 Pcs</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#EBF8F1] text-[#0D824C] border border-[#BCE8D1]">
In Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
15.00 <span class="text-[11px] font-normal text-outline">/ Pc</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 5: Bic Cristal - Branch 2 (Low Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Bic Cristal Medium Pen - Blue</div>
<div class="text-[11px] text-outline font-medium">Bic</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-WRI-044</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Writing Instruments</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 2</td>
<td class="py-3.5 px-4 text-right font-bold text-amber-900 text-[13px]">12 Pcs</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">30 Pcs</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]">
<span class="material-symbols-outlined text-[13px]">warning</span>
Low Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
15.00 <span class="text-[11px] font-normal text-outline">/ Pc</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 6: Kangaro Heavy Duty Stapler 24/6 (Low Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Kangaro Heavy Duty Stapler 24/6</div>
<div class="text-[11px] text-outline font-medium">Kangaro</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-OFF-019</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Office Essentials</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 1</td>
<td class="py-3.5 px-4 text-right font-bold text-amber-900 text-[13px]">3 Pcs</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">5 Pcs</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]">
<span class="material-symbols-outlined text-[13px]">warning</span>
Low Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
120.00 <span class="text-[11px] font-normal text-outline">/ Pc</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 7: Deli Lever Arch File A4 (Damaged Segregated) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Deli Lever Arch File A4</div>
<div class="text-[11px] text-outline font-medium">Deli</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-BIN-082</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Binding &amp; Filing</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 2</td>
<td class="py-3.5 px-4 text-right font-bold text-on-surface text-[13px]">
<div class="">8 Pcs</div>
<div class="inline-block px-1.5 py-0.5 rounded bg-purple-50 text-[10px] text-purple-700 font-semibold border border-purple-200 mt-0.5">2 Damaged (Segregated)</div>
</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">10 Pcs</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-purple-50 text-purple-800 border border-purple-200">
Damaged Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
180.00 <span class="text-[11px] font-normal text-outline">/ Pc</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
<!-- Row 8: Faber-Castell 24 Color Pencils (Out of Stock) -->
<tr class="hover:bg-surface-container-low/40 transition-colors">
<td class="py-3.5 px-5">
<div class="font-bold text-on-surface text-label-md leading-tight">Faber-Castell 24 Color Pencils</div>
<div class="text-[11px] text-outline font-medium">Faber-Castell</div>
</td>
<td class="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant font-medium">STA-ART-005</td>
<td class="py-3.5 px-4">
<span class="inline-block px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-high text-on-surface-variant">Art Supplies</span>
</td>
<td class="py-3.5 px-4 font-medium text-on-surface">Branch 3</td>
<td class="py-3.5 px-4 text-right font-bold text-error text-[13px]">0 Pcs</td>
<td class="py-3.5 px-4 text-right text-outline text-[12px]">8 Pcs</td>
<td class="py-3.5 px-4 text-center">
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm bg-[#FEE4E2] text-[#D92D20] border border-[#FECDCA]">
Out of Stock
</span>
</td>
<td class="py-3.5 px-4 text-right font-semibold text-on-surface font-mono">
320.00 <span class="text-[11px] font-normal text-outline">/ Box</span>
</td>
<td class="py-3.5 px-5 text-center">
<div class="flex items-center justify-center gap-2">
<button onclick="document.getElementById('product-detail-drawer').classList.remove('hidden')" class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary font-label-sm text-[12px] transition-colors">
Details
</button>
<button class="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary font-label-sm text-[12px] flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[15px]">history</span>
<span class="">View Movement</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- TABLE PAGINATION FOOTER -->
<div class="p-4 border-t border-outline-variant bg-surface-container-low/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-label-sm font-label-sm">
<span class="text-on-surface-variant font-medium">
Showing 1–8 of 146 inventory records
</span>
<div class="flex items-center gap-1">
<button class="px-3 py-1.5 rounded border border-outline-variant/60 text-outline cursor-not-allowed bg-surface-container-lowest" disabled="">
Previous
</button>
<button class="px-3 py-1.5 rounded bg-primary text-on-primary font-bold">1</button>
<button class="px-3 py-1.5 rounded border border-outline-variant/80 hover:bg-surface-container-low text-on-surface">2</button>
<button class="px-3 py-1.5 rounded border border-outline-variant/80 hover:bg-surface-container-low text-on-surface">3</button>
<span class="px-2 text-outline">...</span>
<button class="px-3 py-1.5 rounded border border-outline-variant/80 hover:bg-surface-container-low text-on-surface">19</button>
<button class="px-3 py-1.5 rounded border border-outline-variant/80 hover:bg-surface-container-low text-on-surface">
Next
</button>
</div>
</div>
</div>
<!-- ON-DEMAND ACCESSIBLE SLIDE-OVER DRAWER (HIDDEN BY DEFAULT) -->
<div id="product-detail-drawer" class="hidden fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
<div class="absolute inset-0 bg-surface-dim/50 backdrop-blur-[1px] transition-opacity" onclick="document.getElementById('product-detail-drawer').classList.add('hidden')"></div>
<div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
<div class="w-screen max-w-md bg-surface-container-lowest border-l border-outline-variant p-6 shadow-xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
<div class="space-y-6">
<!-- Drawer Header -->
<div class="flex items-center justify-between pb-4 border-b border-outline-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[22px]">inventory_2</span>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Product Details</h2>
</div>
<button onclick="document.getElementById('product-detail-drawer').classList.add('hidden')" class="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors">
<span class="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<!-- Identity -->
<div>
<div class="flex items-start justify-between">
<div>
<h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">Double A A4 Copy Paper 80gsm</h3>
<p class="text-label-sm font-label-sm text-outline mt-1">SKU: STA-PAP-001 • Category: Paper &amp; Notebooks</p>
</div>
<span class="text-xs bg-surface-container text-primary font-bold px-2 py-1 rounded">Double A</span>
</div>
<div class="mt-3.5 grid grid-cols-2 gap-2 bg-surface-container-low/70 p-3 rounded-lg border border-outline-variant/60">
<div>
<div class="text-[10px] text-outline uppercase font-semibold">Base Stock Unit</div>
<div class="text-label-md font-label-md text-on-surface font-bold">1 Ream (500 Sheets)</div>
</div>
<div>
<div class="text-[10px] text-outline uppercase font-semibold">Configured Packaging</div>
<div class="text-label-md font-label-md text-on-surface font-bold">1 Box = 5 Reams</div>
</div>
</div>
</div>
<!-- Multi-Branch Distribution -->
<div class="space-y-2.5">
<div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm uppercase font-bold text-outline">Multi-Branch Distribution</span>
<span class="text-label-sm font-label-sm text-primary font-bold">Total: 128 Reams</span>
</div>
<div class="space-y-2">
<div class="p-3 rounded border border-outline-variant/70 flex items-center justify-between bg-surface-container-lowest">
<div>
<div class="text-label-md font-label-md font-semibold text-on-surface">Branch 1</div>
<div class="text-[11px] text-outline">Threshold: Min 20 Reams</div>
</div>
<div class="text-right">
<div class="text-label-md font-label-md font-bold text-[#0D824C]">120 Reams</div>
</div>
</div>
<div class="p-3 rounded border border-amber-200 bg-amber-50/40 flex items-center justify-between">
<div>
<div class="text-label-md font-label-md font-semibold text-on-surface">Branch 2</div>
<div class="text-[11px] text-outline">Threshold: Min 15 Reams</div>
</div>
<div class="text-right">
<div class="text-label-md font-label-md font-bold text-[#A16207]">8 Reams</div>
<span class="text-[10px] font-semibold text-amber-700">Low Stock</span>
</div>
</div>
<div class="p-3 rounded border border-red-200 bg-red-50/40 flex items-center justify-between">
<div>
<div class="text-label-md font-label-md font-semibold text-on-surface">Branch 3</div>
<div class="text-[11px] text-outline">Threshold: Min 10 Reams</div>
</div>
<div class="text-right">
<div class="text-label-md font-label-md font-bold text-error">0 Reams</div>
<span class="text-[10px] font-semibold text-error">Out of Stock</span>
</div>
</div>
</div>
</div>
<!-- Owner Financial Valuation Container -->
<div class="p-4 bg-[#FFF8E7] rounded-lg border border-[#E5DCBE] space-y-3">
<div class="flex items-center justify-between border-b border-[#E5DCBE] pb-2">
<span class="text-label-sm font-label-sm font-bold text-[#1E2430] flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
Owner Valuation Metrics
</span>
</div>
<div class="grid grid-cols-2 gap-2 pt-1">
<div>
<div class="text-[10px] text-[#666255] uppercase font-semibold">Weighted Average Cost</div>
<div class="text-label-md font-label-md font-bold text-on-surface">ETB 185.50 / Ream</div>
</div>
<div>
<div class="text-[10px] text-[#666255] uppercase font-semibold">Total Stock Value</div>
<div class="text-label-md font-label-md font-bold text-primary">ETB 23,744.00</div>
</div>
</div>
<div class="pt-2 text-[12px] text-[#666255] border-t border-[#E5DCBE]/60 flex justify-between">
<span class="">Standard Selling Price:</span>
<span class="font-bold text-on-surface">ETB 250.00 / Ream</span>
</div>
</div>
</div>
<!-- Single Action Link -->
<div class="pt-4 border-t border-outline-variant">
<a class="w-full flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary text-on-surface hover:text-primary transition-colors text-label-md font-label-md bg-surface-container-low" href="#">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">timeline</span>
<span class="">View Stock Movement History</span>
</div>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
</main>
<!-- OPERATIONAL STATUS FOOTER BAR -->

</div>


</body></html>




#Sales Details 



<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Sale Details - Gelana Management System</title>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Plus Jakarta Sans Font -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS CDN with plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration verbatim from Design System -->
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "surface-container-low": "#f1f3ff",
            "outline": "#747688",
            "on-primary-fixed-variant": "#0033c0",
            "primary": "#0035c5",
            "on-background": "#161c27",
            "on-surface-variant": "#434657",
            "on-secondary-fixed": "#1e1c12",
            "on-secondary-container": "#666255",
            "on-primary-container": "#d4d9ff",
            "primary-fixed": "#dde1ff",
            "on-tertiary-fixed-variant": "#8a1c00",
            "on-tertiary-fixed": "#3d0700",
            "inverse-on-surface": "#ecf0ff",
            "secondary-fixed": "#e9e2d2",
            "tertiary-container": "#b82800",
            "tertiary": "#8d1c00",
            "primary-container": "#0047ff",
            "on-error": "#ffffff",
            "tertiary-fixed-dim": "#ffb4a2",
            "inverse-primary": "#b9c3ff",
            "inverse-surface": "#2a303d",
            "surface-container-highest": "#dde2f3",
            "surface-bright": "#f9f9ff",
            "on-tertiary-container": "#ffd1c6",
            "surface-tint": "#0046fa",
            "on-primary": "#ffffff",
            "on-surface": "#161c27",
            "outline-variant": "#c4c5da",
            "error": "#ba1a1a",
            "on-primary-fixed": "#001257",
            "surface-container-lowest": "#ffffff",
            "surface-container": "#e8eefe",
            "on-secondary": "#ffffff",
            "on-error-container": "#93000a",
            "secondary-fixed-dim": "#ccc6b6",
            "tertiary-fixed": "#ffdad2",
            "surface-dim": "#d4daea",
            "secondary": "#625e51",
            "error-container": "#ffdad6",
            "surface-variant": "#dde2f3",
            "secondary-container": "#e6dfcf",
            "on-tertiary": "#ffffff",
            "primary-fixed-dim": "#b9c3ff",
            "background": "#f9f9ff",
            "surface-container-high": "#e3e8f9",
            "on-secondary-fixed-variant": "#4a473b",
            "surface": "#f9f9ff"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "gutter": "1.25rem",
            "gutter-mobile": "0.75rem",
            "space-xs": "0.25rem",
            "margin": "2rem",
            "space-xl": "2rem",
            "space-lg": "1.5rem",
            "margin-mobile": "1rem",
            "space-sm": "0.5rem",
            "space-md": "1rem"
          },
          "fontFamily": {
            "headline-xl": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }]
          }
        },
      },
    }
  </script>
<style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #f9f9ff;
      color: #161c27;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }
  </style>
</head>
<body class="bg-background text-on-surface flex min-h-screen">
<!-- LEFT SIDEBAR NAVIGATION (Anchored from Shared Components JSON: SideNavBar) -->
<aside class="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30">
<div class="flex flex-col h-full justify-between p-4">
<!-- Top Brand Section -->
<div>
<div class="flex items-center gap-3 px-2 py-3 mb-4">
<div class="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-center">
<img alt="Gelana Stationery Logo" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPXgJ66hvyoikVSPqHxKHbuxW0vgyC95SI-gVwKK6lT-EegPYf6tfFMw8gxgvJTR0SvViOirRxUeF1Ryqj6kfKdT1b5YtcK-gw-79_vpVJhMJOAd4bm3dNBwxaQblk3loujkDvI9oJW9YiTcVx5xnt5eTHhEUzwy1pVzo0LkKzGVkJtT4Uk5kRE67dsVRiVoq1m82t8F4eWXegSxkyeczYotru8GOYxmxlXWG9_FVwTJnfm-sHbf6v434KJcCJCuOI">
</div>
<div class="flex flex-col min-w-0">
<span class="text-headline-sm font-headline-sm font-bold text-on-surface truncate">Gelana Stationery</span>

</div>
</div>
<!-- Navigation Tabs List -->
<nav class="space-y-1">
<!-- 1. Dashboard -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<!-- 2. Sales (ACTIVE TAB based on page intent: Sale Details) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded bg-primary-fixed text-primary font-semibold border-l-4 border-primary transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">point_of_sale</span>
<span class="text-label-md font-label-md">Sales</span>
</a>
<!-- 3. Inventory -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<!-- 4. Transfers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">sync_alt</span>
<span class="text-label-md font-label-md">Transfers</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">category</span>
<span class="text-label-md font-label-md">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">local_shipping</span>
<span class="text-label-md font-label-md">Suppliers</span>
</a>
<!-- 7. Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">lock_clock</span>
<span class="text-label-md font-label-md">Daily Closing</span>
</a>
<!-- 8. Reports -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">bar_chart</span>
<span class="text-label-md font-label-md">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">badge</span>
<span class="text-label-md font-label-md">Users &amp; Branches</span>
</a>
<!-- 10. Notifications -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">notifications</span>
<span class="text-label-md font-label-md">Notifications</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
</nav>
</div>
<!-- Footer Action Tabs -->

</div>
</aside>
<!-- MAIN WRAPPER WITH STICKY TOP NAV AND PAGE CANVAS -->
<div class="ml-64 flex-1 flex flex-col min-h-screen bg-background">
<!-- TOP NAVIGATION BAR (Anchored from Shared Components JSON: TopNavBar) -->
<header class="sticky top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-14 px-gutter flex justify-between items-center shrink-0">
<!-- Left: Breadcrumbs -->
<div class="flex items-center gap-2">
<span class="text-label-sm font-label-sm text-on-surface-variant">Sales</span>
<span class="text-label-sm font-label-sm text-outline">/</span>
<a class="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Sales History</a>
<span class="text-label-sm font-label-sm text-outline">/</span>
<span class="text-label-sm font-label-sm text-primary font-semibold">SAL-000123</span>
</div>
<!-- Right: Badges, Trailing Actions, Profile -->
<div class="flex items-center gap-3">
<!-- Online Sync Status Badge -->
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EBF8F1] text-[#0D824C] border border-[#A6F4C5]">
<span class="w-1.5 h-1.5 rounded-full bg-[#0D824C] animate-pulse"></span>
<span class="text-label-sm font-label-sm font-semibold">Online — All synced</span>
</div>
<!-- Branch Indicator Badge -->
<div class="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant border border-outline-variant">
<span class="material-symbols-outlined text-[15px]">store</span>
<span class="text-label-sm font-label-sm font-semibold">Branch 1</span>
</div>
<!-- Trailing Icon Actions -->
<button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors" title="Notifications">
<span class="material-symbols-outlined text-[20px]">notifications</span>
</button>

<div class="h-4 w-px bg-outline-variant mx-1"></div>
<!-- User Profile Pill -->
<div class="flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-surface-container transition-colors cursor-pointer">
<div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm font-label-sm">
            AG
          </div>
<span class="text-label-md font-label-md text-on-surface font-medium">Abebe G. (Owner)</span>
<span class="material-symbols-outlined text-[16px] text-outline">expand_more</span>
</div>
</div>
</header>
<!-- MAIN BODY CANVAS -->
<main class="p-gutter space-y-gutter flex-1 max-w-[1600px] w-full mx-auto">
<!-- TOP ACTION BAR & NAVIGATION HEADING -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
<div>
<a class="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-primary hover:underline mb-1 group" href="#">
<span class="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
<span class="">Back to Sales History</span>
</a>
<div class="flex items-center gap-3">
<h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">Sale Details</h1>
<span class="px-2.5 py-0.5 rounded font-mono text-label-md font-label-md bg-surface-container-high text-on-surface border border-outline-variant">SAL-000123</span>
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-[#EBF8F1] text-[#0D824C] border border-[#A6F4C5]">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
<span class="">Completed</span>
</span>
</div>
</div>
<!-- Action Buttons Cluster -->
<div class="flex items-center gap-2">
<!-- View Linked Return Button -->
<a class="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-label-md font-label-md transition-colors" href="#return-record">
<span class="material-symbols-outlined text-[18px] text-primary">keyboard_return</span>
<span class="">View Return (RET-000007)</span>
</a>
<!-- Correct Sale Button (Secondary Outline) -->
<button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-md font-label-md shadow-sm transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">edit_note</span>
<span class="">Correct Sale</span>
</button>
<!-- Void Sale Button (Destructive / Danger Outline) -->
<button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-error/30 hover:bg-error-container text-error text-label-md font-label-md transition-colors" onclick="document.getElementById('void-modal').classList.remove('hidden')" type="button">
<span class="material-symbols-outlined text-[18px]">cancel</span>
<span class="">Void Sale</span>
</button>
</div>
</div>
<!-- 1. SALE IDENTITY & METADATA HEADER CARD -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
<div class="flex items-center justify-between pb-3.5 mb-4 border-b border-outline-variant"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">info</span><span class="text-label-lg font-label-lg text-on-surface">Sale Information</span></div></div>
<div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6"><div><span class="block text-label-sm font-label-sm text-outline">Branch</span><span class="text-body-md font-body-md font-semibold text-on-surface mt-0.5 flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-outline">location_on</span>Branch 1</span></div><div><span class="block text-label-sm font-label-sm text-outline">Business Date</span><span class="text-body-md font-body-md font-semibold text-on-surface mt-0.5">Today</span></div><div><span class="block text-label-sm font-label-sm text-outline">Recorded Date &amp; Time</span><span class="text-body-md font-body-md text-on-surface mt-0.5">Today, 4:32 PM</span></div><div><span class="block text-label-sm font-label-sm text-outline">Recorded By</span><span class="text-body-md font-body-md text-on-surface mt-0.5 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary"></span>Dawit T.</span></div><div><span class="block text-label-sm font-label-sm text-outline">Sale Status</span><span class="inline-block mt-0.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-[#EBF8F1] text-[#0D824C] font-semibold">Completed</span></div><div><span class="block text-label-sm font-label-sm text-outline">Payment Status</span><span class="inline-block mt-0.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-primary font-semibold">Paid in Full</span></div><div><span class="block text-label-sm font-label-sm text-outline">Sync Status</span><span class="text-body-md font-body-md text-on-surface mt-0.5 flex items-center gap-1 text-[#0D824C]"><span class="material-symbols-outlined text-[16px]">check_circle</span>Online — All synced</span></div></div>
</section>
<!-- 2-COLUMN MAIN LAYOUT: 8 cols left ledger & line items, 4 cols right financial & inventory summaries -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- LEFT COLUMN (8 COLS): Line Items Table & Audit Trail -->
<div class="lg:col-span-8 space-y-gutter">
<!-- 2. SALE ITEMS TABLE CARD -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
<div class="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Sale Items (2 Items)</h2>
<p class="text-body-sm font-body-sm text-on-surface-variant">Historical price snapshot preserved at time of transaction.</p>
</div>

</div>
<!-- Table of Line Items -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
<th class="py-3 px-4">Product &amp; Brand</th>
<th class="py-3 px-3">SKU</th>
<th class="py-3 px-3">Sold Unit</th>
<th class="py-3 px-3 text-right">Quantity</th>
<th class="py-3 px-4 text-right">Historical Price</th>
<th class="py-3 px-3 text-right">Discount</th>
<th class="py-3 px-4 text-right">Line Total</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant text-body-md font-body-md text-on-surface">
<!-- Row 1 -->
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="py-3.5 px-4">
<div class="font-semibold text-on-surface">Double A A4 Paper 80gsm</div>
<div class="text-body-sm font-body-sm text-outline">Brand: Double A</div>
</td>
<td class="py-3.5 px-3 font-mono text-body-sm font-body-sm text-on-surface-variant">STA-PAP-001</td>
<td class="py-3.5 px-3">
<span class="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface">
                        Ream (Base)
                      </span>
</td>
<td class="py-3.5 px-3 text-right font-medium">2 Reams</td>
<td class="py-3.5 px-4 text-right font-mono">ETB 250.00</td>
<td class="py-3.5 px-3 text-right text-outline">—</td>
<td class="py-3.5 px-4 text-right font-semibold font-mono text-on-surface">ETB 500.00</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container-low/50 transition-colors">
<td class="py-3.5 px-4">
<div class="font-semibold text-on-surface">Bic Cristal Medium Pen - Blue</div>
<div class="text-body-sm font-body-sm text-outline">Brand: Bic</div>
</td>
<td class="py-3.5 px-3 font-mono text-body-sm font-body-sm text-on-surface-variant">STA-WRI-044</td>
<td class="py-3.5 px-3">
<span class="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface">
                        Pc (Base)
                      </span>
</td>
<td class="py-3.5 px-3 text-right font-medium">5 Pcs</td>
<td class="py-3.5 px-4 text-right font-mono">ETB 15.00</td>
<td class="py-3.5 px-3 text-right text-outline">—</td>
<td class="py-3.5 px-4 text-right font-semibold font-mono text-on-surface">ETB 75.00</td>
</tr>
</tbody>
</table>
</div>
<!-- Historical Snapshot Callout Banner -->
<div class="p-3 bg-surface-container-low border-t border-outline-variant flex items-start gap-2.5"><span class="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span><p class="text-body-sm font-body-sm text-on-surface-variant"><strong class="font-semibold text-on-surface">Historical information:</strong> The price and unit shown here are the values recorded when this sale was made. Later product changes do not change this sale.</p></div>
</div>
<!-- 6. ASSOCIATED RETURNS SECTION -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm space-y-4" id="return-record">
<div class="flex items-center justify-between pb-3 border-b border-outline-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">assignment_return</span>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Associated Returns (1 Return)</h3>
</div>
<span class="px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-[#EBF8F1] text-[#0D824C] font-semibold border border-[#A6F4C5]">
                Return Processed
              </span>
</div>
<div class="bg-[#FFF8E7]/40 border border-[#E5DCBE] rounded-lg p-4">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5DCBE]">
<div>
<div class="flex items-center gap-2">
<span class="font-mono text-label-lg font-label-lg font-bold text-on-surface">RET-000007</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">• Processed on Oct 25, 2025, 10:15 AM</span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant">Processed by <strong>Abebe G. (Owner)</strong></span>
</div>
<div class="text-right">
<span class="text-label-sm font-label-sm text-outline block">Refund Amount</span>
<span class="text-headline-sm font-headline-sm font-bold text-primary font-mono">ETB 250.00</span>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-body-sm font-body-sm">
<div>
<span class="text-label-sm font-label-sm text-outline block">Returned Item</span>
<span class="font-medium text-on-surface">1 × Double A A4 Paper 80gsm (Ream)</span>
</div>
<div>
<span class="text-label-sm font-label-sm text-outline block">Condition Assessment</span>
<span class="inline-flex items-center gap-1 text-[#0D824C] font-medium">
<span class="material-symbols-outlined text-[15px]">verified</span>
                    Sellable (Restocked)
                  </span>
</div>
<div>
<span class="text-label-sm font-label-sm text-outline block">Inventory Reversal</span>
<span class="font-medium text-primary font-mono">+1 Ream to Branch 1 Stock</span>
</div>
</div>
<div class="mt-4 pt-3 border-t border-[#E5DCBE] flex justify-end">
<a class="inline-flex items-center gap-1 text-primary text-label-md font-label-md hover:underline font-semibold" href="#">
<span class="">View Return Record (RET-000007)</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</div>
<!-- 7. CORRECTIONS & AUDIT HISTORY SECTION -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm space-y-5">
<!-- Transaction Corrections Sub-card -->
<div><div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-outline text-[20px]">published_with_changes</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Sale Corrections</h3></div><div class="p-3 bg-surface-container-low rounded border border-outline-variant flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant"><span class="material-symbols-outlined text-[18px] text-[#0D824C]">check_circle</span><span class="">No corrections recorded for this sale. Corrections are recorded separately so the original sale history is preserved.</span></div></div>
<!-- Activity History (Append-Only Audit Trail) -->
<div class="pt-2">
<div class="flex items-center justify-between pb-3 border-b border-outline-variant">
<div>
<h4 class="text-label-lg font-label-lg text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[18px]">history</span>
                    Activity History
                  </h4>
<p class="text-body-sm font-body-sm text-on-surface-variant">Important changes and events related to this sale.</p>
</div>
<span class="text-label-sm font-label-sm text-outline">3 Events logged</span>
</div>
<!-- Timeline of Events -->
<div class="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant mt-4"><span class="material-symbols-outlined text-[15px]">history_toggle_drop_down</span><span class="">History is preserved. Corrections create new records rather than overwriting the original sale.</span></div>
<!-- Immutability Guarantee Note -->
<div class="mt-4 pt-3 border-t border-outline-variant flex items-center gap-1.5 text-label-sm font-label-sm text-outline"><span class="material-symbols-outlined text-[15px]">history_toggle_drop_down</span><span class="">History is preserved. Corrections create new records rather than overwriting the original sale.</span></div>
</div>
</div>
</div>
<!-- RIGHT COLUMN (4 COLS): Financial Breakdown, Payment Allocation, Inventory Effect & Owner COGS -->
<div class="lg:col-span-4 space-y-gutter">
<!-- 3. FINANCIAL TOTALS CARD -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
<h3 class="text-headline-sm font-headline-sm text-on-surface pb-3 border-b border-outline-variant">
              Financial Summary
            </h3>
<div class="py-3 space-y-2.5 text-body-md font-body-md">
<div class="flex justify-between items-center text-on-surface-variant">
<span class="">Subtotal (2 Items)</span>
<span class="font-mono text-on-surface font-medium">ETB 575.00</span>
</div>
<div class="flex justify-between items-center text-[#D92D20]">
<span class="flex items-center gap-1">
<span class="">Sale Discount</span>
<span class="text-label-sm font-label-sm px-1.5 py-0.2 rounded bg-error-container text-error">Applied</span>
</span>
<span class="font-mono font-medium">- ETB 25.00</span>
</div>
<div class="pt-2 border-t border-outline-variant flex justify-between items-baseline">
<span class="text-label-lg font-label-lg text-on-surface">Total Amount</span>
<span class="text-headline-xl font-headline-xl text-primary font-mono font-bold tracking-tight">ETB 550.00</span>
</div>
<div class="flex justify-between items-center pt-2 text-body-sm font-body-sm border-t border-dashed border-outline-variant">
<span class="text-on-surface-variant">Payment Status</span>
<span class="font-semibold text-[#0D824C] flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">done_all</span>
                  Fully Allocated
                </span>
</div>
<div class="flex justify-between items-center text-body-sm font-body-sm text-outline">
<span class="">Remaining Balance</span>
<span class="font-mono font-semibold text-on-surface">ETB 0.00</span>
</div>
</div>
</div>
<!-- 3B. RECORDED PAYMENTS CARD (Configurable Split Payment) -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm space-y-3"><div class="flex items-center justify-between pb-2 border-b border-outline-variant"><h3 class="text-headline-sm font-headline-sm text-on-surface">Payment Allocation</h3><span class="text-label-sm font-label-sm px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">2 Methods</span></div><div class="space-y-3"><div class="p-3 bg-surface-container-low rounded border border-outline-variant flex items-center justify-between"><div class="flex items-center gap-2.5"><div class="w-8 h-8 rounded bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant"><span class="material-symbols-outlined text-[18px]">payments</span></div><div><span class="text-label-md font-label-md text-on-surface font-semibold block">Cash</span></div></div><div class="text-right"><span class="font-mono font-semibold text-body-md font-body-md text-on-surface">ETB 300.00</span></div></div><div class="p-3 bg-surface-container-low rounded border border-outline-variant flex items-center justify-between"><div class="flex items-center gap-2.5"><div class="w-8 h-8 rounded bg-surface-container-lowest flex items-center justify-center text-primary border border-outline-variant"><span class="material-symbols-outlined text-[18px]">account_balance</span></div><div><span class="text-label-md font-label-md text-on-surface font-semibold block">Bank Transfer</span><span class="text-body-sm font-body-sm font-mono text-outline">Ref: TRX-98241029</span></div></div><div class="text-right"><span class="font-mono font-semibold text-body-md font-body-md text-on-surface">ETB 250.00</span></div></div></div><div class="pt-2 border-t border-outline-variant flex justify-between items-center text-body-sm font-body-sm"><span class="font-medium text-on-surface">Total Paid:</span><span class="font-mono font-bold text-on-surface text-body-lg font-body-lg">ETB 550.00</span></div></div>
<!-- 4. INVENTORY EFFECT SECTION -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm space-y-3">
<div class="flex items-center justify-between pb-2 border-b border-outline-variant">
<div>
<h3 class="text-headline-sm font-headline-sm text-on-surface">Inventory Effect</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Deductions applied upon confirmation</p>
</div>
<span class="material-symbols-outlined text-primary text-[20px]">inventory</span>
</div>
<div class="space-y-2.5">
<div class="p-2.5 rounded bg-surface-container-low border border-outline-variant flex justify-between items-center">
<div>
<span class="text-label-md font-label-md text-on-surface block">Double A A4 Paper 80gsm</span>
<span class="text-body-sm font-body-sm text-outline">Branch 1 Sellable Stock</span>
</div>
<span class="font-mono text-label-md font-label-md font-bold text-[#D92D20] bg-error-container/40 px-2 py-0.5 rounded border border-error/20">
                  -2 Reams
                </span>
</div>
<div class="p-2.5 rounded bg-surface-container-low border border-outline-variant flex justify-between items-center">
<div>
<span class="text-label-md font-label-md text-on-surface block">Bic Cristal Medium Pen - Blue</span>
<span class="text-body-sm font-body-sm text-outline">Branch 1 Sellable Stock</span>
</div>
<span class="font-mono text-label-md font-label-md font-bold text-[#D92D20] bg-error-container/40 px-2 py-0.5 rounded border border-error/20">
                  -5 Pcs
                </span>
</div>
</div>
<!-- Ledger Status Indicator -->
<div class="pt-2 flex items-center gap-2 text-label-sm font-label-sm text-[#0D824C]"><span class="material-symbols-outlined text-[16px]">task_alt</span><span class="">Stock updated when the sale was confirmed.</span></div>
</div>
<!-- 5. OWNER-ONLY FINANCIAL ANALYSIS (Cost & Margin) -->
<div class="bg-[#FFF8E7] border border-[#E5DCBE] rounded-lg p-5 shadow-sm space-y-3"><div class="flex items-start justify-between pb-2 border-b border-[#E5DCBE]"><div><div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px] text-primary">visibility</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Cost &amp; Margin Breakdown</h3></div><span class="text-label-sm font-label-sm text-on-secondary-fixed font-semibold mt-0.5 inline-block">Owner Visibility • Cost basis: Weighted Average Cost</span></div><span class="px-2 py-0.5 rounded bg-surface-container-lowest text-primary text-label-sm font-label-sm font-bold border border-outline-variant">Confidential</span></div><div class="space-y-2 text-body-sm font-body-sm"><div class="flex justify-between items-center text-on-surface-variant"><span class="">Total Sale Revenue</span><span class="font-mono font-medium text-on-surface">ETB 550.00</span></div><div class="flex justify-between items-center text-on-surface-variant"><span class="">Recorded Cost</span><span class="font-mono font-medium text-on-surface">ETB 395.00</span></div><div class="pl-2 border-l-2 border-outline-variant text-[11px] text-outline font-mono"><div class="">• Double A: 2 × ETB 185.00 = ETB 370.00</div><div class="">• Bic Pens: 5 × ETB 5.00 = ETB 25.00</div></div><div class="pt-2 border-t border-[#E5DCBE] flex justify-between items-center"><span class="font-semibold text-on-surface">Gross Profit:</span><span class="font-mono font-bold text-headline-sm font-headline-sm text-[#0D824C]">ETB 155.00</span></div><div class="flex justify-between items-center"><span class="font-semibold text-on-surface">Gross Margin (%):</span><span class="font-mono font-bold text-headline-sm font-headline-sm text-[#0D824C]">28.2%</span></div></div><p class="text-body-sm font-body-sm text-on-secondary-fixed pt-2 border-t border-[#E5DCBE]/60">Cost used for this sale is based on the Weighted Average Cost recorded at the time of the transaction.</p></div>
</div>
</div>
</main>
</div>
<!-- VOID SALE CONFIRMATION MODAL (HIDDEN BY DEFAULT) -->
<div class="fixed inset-0 z-50 bg-[#1E2430]/40 flex items-center justify-center p-4 hidden" id="void-modal">
<div class="bg-surface-container-lowest rounded-lg border border-outline-variant max-w-md w-full p-6 shadow-2xl space-y-4"><div class="flex items-center gap-3 text-error"><div class="w-10 h-10 rounded-full bg-error-container flex items-center justify-center"><span class="material-symbols-outlined text-[24px]">warning</span></div><div><h3 class="text-headline-sm font-headline-sm text-on-surface">Void Sale</h3><span class="text-label-sm font-label-sm text-outline">SAL-000123</span></div></div><p class="text-body-md font-body-md text-on-surface-variant">Voiding this sale will preserve the original sale record and record the reversal in its history. The stock effect of this sale will be reversed as part of the void.</p><div class="space-y-1.5"><label class="block text-label-md font-label-md text-on-surface">Reason for voiding <span class="text-error">*</span></label><textarea class="w-full text-body-md font-body-md rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Enter reason for voiding..." rows="3"></textarea></div><div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant"><button class="px-4 py-2 rounded text-label-md font-label-md text-on-surface hover:bg-surface-container transition-colors" onclick="document.getElementById('void-modal').classList.add('hidden')" type="button">Cancel</button><button class="px-4 py-2 rounded bg-error text-on-error text-label-md font-label-md hover:bg-error/90 transition-colors" onclick="alert('Sale voided successfully.'); document.getElementById('void-modal').classList.add('hidden');" type="button">Void Sale</button></div></div>
</div>


</body></html>



#Daily Clothing



<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Daily Closing | Gelana Stationery Enterprise Suite</title>
<!-- Material Symbols Outlined font -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Plus Jakarta Sans Font Family -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "secondary-fixed": "#e9e2d2",
            "outline": "#747688",
            "background": "#f9f9ff",
            "on-secondary": "#ffffff",
            "on-surface-variant": "#434657",
            "primary-fixed-dim": "#b9c3ff",
            "surface-container-high": "#e3e8f9",
            "on-secondary-container": "#666255",
            "surface-container-highest": "#dde2f3",
            "surface-variant": "#dde2f3",
            "on-background": "#161c27",
            "on-primary": "#ffffff",
            "tertiary-fixed-dim": "#ffb4a2",
            "on-surface": "#161c27",
            "on-error-container": "#93000a",
            "on-error": "#ffffff",
            "on-primary-fixed": "#001257",
            "on-tertiary-fixed": "#3d0700",
            "surface-container": "#e8eefe",
            "error": "#ba1a1a",
            "on-primary-container": "#d4d9ff",
            "inverse-surface": "#2a303d",
            "surface-bright": "#f9f9ff",
            "primary": "#0035c5",
            "secondary-fixed-dim": "#ccc6b6",
            "surface-tint": "#0046fa",
            "on-secondary-fixed-variant": "#4a473b",
            "on-primary-fixed-variant": "#0033c0",
            "surface-container-lowest": "#ffffff",
            "secondary": "#625e51",
            "tertiary-fixed": "#ffdad2",
            "outline-variant": "#c4c5da",
            "primary-fixed": "#dde1ff",
            "on-tertiary": "#ffffff",
            "surface-dim": "#d4daea",
            "primary-container": "#0047ff",
            "error-container": "#ffdad6",
            "inverse-on-surface": "#ecf0ff",
            "tertiary-container": "#b82800",
            "inverse-primary": "#b9c3ff",
            "surface": "#f9f9ff",
            "on-secondary-fixed": "#1e1c12",
            "tertiary": "#8d1c00",
            "on-tertiary-container": "#ffd1c6",
            "surface-container-low": "#f1f3ff",
            "on-tertiary-fixed-variant": "#8a1c00",
            "secondary-container": "#e6dfcf"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "gutter": "1.25rem",
            "space-xl": "2rem",
            "margin-mobile": "1rem",
            "space-xs": "0.25rem",
            "margin": "2rem",
            "gutter-mobile": "0.75rem",
            "space-sm": "0.5rem",
            "space-lg": "1.5rem",
            "space-md": "1rem"
          },
          "fontFamily": {
            "headline-xl": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      font-size: 20px;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    body {
      background-color: #f9f9ff;
      color: #161c27;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .surface-card {
      background-color: #ffffff;
      border: 1px solid #c4c5da;
      box-shadow: 0 1px 3px rgba(30, 36, 48, 0.04), 0 1px 2px rgba(30, 36, 48, 0.02);
    }
  </style>
</head>
<body class="bg-surface text-on-surface antialiased min-h-screen flex">
<!-- Side Navigation Bar (from JSON: w-64 fixed left-0 top-0 h-screen flex flex-col justify-between) -->
<aside class="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30 select-none">
<!-- Brand Header -->
<div class="p-4 border-b border-outline-variant flex items-center gap-3">
<img alt="Gelana Stationery Logo" class="w-10 h-10 rounded-lg object-contain shadow-xs border border-outline-variant bg-white p-0.5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOPpWGBTNvBEM4DRGMAVRXEwLEyHtb0EKzkCg0Su7PplED-hd-5JRrkxj0y9L14nQv8kuMm48vV6aWKgR0nmdeY9bte_uxqtc1N1UNYhtcdjTnAd-ls_Wxul1bkmWcsqVVp-45c1cDQGBV_khk4r41Zg0tiEQUHsWWXESLARqZhv4CdOU5qyuzJO7Fb_TYIBxfXHgfTpBFkVWpWt-yg4dU8pisgJEmKZxV3AAcL5W8FIyzfb80fcDT-yqjq9FOK38b">
<div class="overflow-hidden">
<h1 class="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight truncate">Gelana Stationery</h1>
<p class="text-label-sm font-label-sm text-outline truncate">Inventory &amp; Sales</p>
</div>
</div>
<!-- Navigation Items List (11 Standard Tabs from JSON) -->
<div class="flex-1 overflow-y-auto px-3 py-3 space-y-1">
<!-- 1. Dashboard -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="dashboard">dashboard</span>
<span class="">Dashboard</span>
</a>
<!-- 2. Sales -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="point_of_sale">point_of_sale</span>
<span class="">Sales</span>
</a>
<!-- 3. Inventory -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="inventory_2">inventory_2</span>
<span class="">Inventory</span>
</a>
<!-- 4. Transfers -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="sync_alt">sync_alt</span>
<span class="">Transfers</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="category">category</span>
<span class="">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="local_shipping">local_shipping</span>
<span class="">Suppliers</span>
</a>
<!-- 7. Daily Closing (ACTIVE Navigation Item) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded bg-primary-fixed text-primary font-semibold border-l-4 border-primary transition-all cursor-pointer text-label-md font-label-md" href="#">
<span class="material-symbols-outlined text-primary" data-icon="lock_clock" style="font-variation-settings: 'FILL' 1;">lock_clock</span>
<span class="">Daily Closing</span>
</a>
<!-- 8. Reports -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="bar_chart">bar_chart</span>
<span class="">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="badge">badge</span>
<span class="">Users &amp; Branches</span>
</a>
<!-- 10. Notifications -->
<a class="flex items-center justify-between px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-outline" data-icon="notifications">notifications</span>
<span class="">Notifications</span>
</div>
<span class="bg-primary-container text-on-primary text-label-sm font-label-sm px-1.5 py-0.5 rounded-full">4</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-body-sm font-body-sm" href="#">
<span class="material-symbols-outlined text-outline" data-icon="settings">settings</span>
<span class="">Settings</span>
</a>
</div>
<!-- Navigation Footer (System & Support) -->

</aside>
<!-- Main Application Wrapper -->
<div class="flex-1 ml-64 min-h-screen flex flex-col bg-surface">
<!-- Top Navigation Bar (from JSON: sticky top-0, h-14, px-gutter) -->
<header class="sticky top-0 z-20 h-14 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between px-gutter">
<!-- Breadcrumbs & Business Date -->
<div class="flex items-center gap-3 text-body-sm font-body-sm">
<div class="flex items-center gap-1.5 text-outline">
<span class="">Daily Closing</span>
<span class="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span>
<span class="text-on-surface font-semibold">Branch 1</span>
<span class="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span>
<span class="text-primary font-semibold">October 5, 2026</span>
</div>
<div class="h-4 w-[1px] bg-outline-variant mx-1"></div>
<!-- Scope Branch Selector -->
<div class="relative inline-flex items-center">
<label class="sr-only" for="branch-selector">Select Branch Scope</label>
<div class="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded px-2.5 py-1 text-label-md font-label-md text-on-surface">
<span class="material-symbols-outlined text-primary text-[18px]" data-icon="store">store</span>
<select class="bg-transparent border-0 p-0 text-on-surface font-semibold focus:ring-0 cursor-pointer pr-4 text-label-md" id="branch-selector">
<option selected="" value="b1">Branch 1</option>
<option value="b2">Branch 2</option>
<option value="b3">Branch 3</option>
<option value="all">All Branches</option>
</select>
</div>
</div>
<!-- Business Date Pill -->
<span class="hidden xl:inline-flex items-center gap-1.5 bg-surface-container px-2 py-0.5 rounded text-label-sm font-label-sm text-on-surface-variant border border-outline-variant">
<span class="material-symbols-outlined text-[16px] text-primary" data-icon="calendar_today">calendar_today</span>
<span class="">Business Date: October 5, 2026</span>
</span>
</div>
<!-- Trailing Action Cluster -->
<div class="flex items-center gap-4">
<!-- Online Approved Sync Status Indicator -->
<div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-label-sm font-label-sm text-emerald-800">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="font-semibold">Online — All synced</span>
</div>
<div class="h-5 w-[1px] bg-outline-variant"></div>
<!-- Notification Icon Button -->
<button aria-label="Notifications" class="relative p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors" title="Notifications">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
</button>
<!-- Help Icon Button -->

<div class="h-5 w-[1px] bg-outline-variant"></div>
<!-- Profile Cluster -->
<div class="flex items-center gap-2.5 pl-1">
<div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-label-md border border-primary/20">
            AG
          </div>
<div class="text-left hidden lg:block">
<p class="text-label-md font-label-md text-on-surface leading-tight">Abebe G.</p>
<p class="text-label-sm font-label-sm text-outline">Owner</p>
</div>
<span class="material-symbols-outlined text-outline text-[18px]" data-icon="arrow_drop_down">arrow_drop_down</span>
</div>
</div>
</header>
<!-- Page Body Content Canvas -->
<main class="flex-1 p-margin space-y-6 max-w-[1600px] w-full mx-auto">
<!-- Top Page Banner & Header -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
<div>
<div class="flex items-center gap-3">
<h2 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">Daily Closing</h2>
<!-- Status Badge: Submitted — Awaiting Approval -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md bg-amber-50 text-amber-800 border border-amber-200">
<span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Submitted — Awaiting Approval
            </span>
</div>
<p class="text-body-md font-body-md text-on-surface-variant mt-1">
            Review and reconcile the day's recorded sales and payments before closing the business day.
          </p>
</div>
<!-- Quick Summary Actions / Context Tags -->
<div class="flex items-center gap-2 self-start md:self-auto"><div class="bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded flex items-center gap-2 text-label-md font-label-md shadow-xs"><span class="text-outline">Closing ID:</span><span class="font-bold text-on-surface font-mono">CLS-000031</span></div></div>
</div>
<!-- 2-Column Grid Layout (Col 1: 7 cols / 60%, Col 2: 5 cols / 40%) -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
<!-- ============================================== -->
<!-- COLUMN 1: Reconciliation & Auditing (7 Cols)  -->
<!-- ============================================== -->
<div class="xl:col-span-7 space-y-space-lg">
<!-- 1. Business Context & Reconciliation Status Card -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest">
<div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" data-icon="inventory">inventory</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Closing Summary</h3></div><span class="text-label-sm font-label-sm text-outline">Branch 1</span></div>
<!-- Lifecycle Progress Indicator -->
<div class="mb-5 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
<div class="flex items-center justify-between text-label-sm font-label-sm text-outline mb-2">
<span class="flex items-center gap-1 text-on-surface font-semibold">
<span class="material-symbols-outlined text-emerald-600 text-[16px]" data-icon="check_circle">check_circle</span>
                  1. Not Submitted
                </span>
<span class="flex items-center gap-1 text-primary font-bold">
<span class="material-symbols-outlined text-primary text-[16px]" data-icon="radio_button_checked">radio_button_checked</span>
                  2. Submitted — Awaiting Approval
                </span>
<span class="flex items-center gap-1 text-outline">
<span class="material-symbols-outlined text-[16px]" data-icon="radio_button_unchecked">radio_button_unchecked</span>
                  3. Approved / Rejected
                </span>
</div>
<!-- Progress bar -->
<div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
<div class="bg-primary h-full rounded-full w-2/3"></div>
</div>
</div>
<!-- Detailed Metrics Grid -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-body-sm"><div class="p-3 bg-surface rounded border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Branch</p><p class="text-headline-sm font-headline-sm text-on-surface mt-0.5 font-semibold">Branch 1</p></div><div class="p-3 bg-surface rounded border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Business Date</p><p class="text-headline-sm font-headline-sm text-on-surface mt-0.5 font-semibold">Oct 5, 2026</p><p class="text-[11px] text-outline mt-0.5">Monday</p></div><div class="p-3 bg-surface rounded border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Submitted By</p><p class="text-headline-sm font-headline-sm text-on-surface mt-0.5 font-semibold">Dawit T.</p><p class="text-[11px] text-outline mt-0.5">Branch Staff</p></div><div class="p-3 bg-surface rounded border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Submitted Time</p><p class="text-headline-sm font-headline-sm text-on-surface mt-0.5 font-semibold font-mono">6:45 PM</p></div></div>
<!-- Status Note Notice -->
<div class="mt-4 flex items-center gap-2.5 px-3 py-2 bg-secondary-fixed/40 border border-secondary-fixed rounded text-on-surface text-label-md font-label-md"><span class="material-symbols-outlined text-secondary text-[20px]" data-icon="lock">lock</span><span class="">Submitted closings are locked from normal employee editing while awaiting Owner review.</span></div>
</div>
<!-- 2. Sales & Payment Reconciliation Summary Card -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest">
<div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4"><div><h3 class="text-headline-sm font-headline-sm text-on-surface">Sales &amp; Payment Summary</h3><p class="text-label-sm font-label-sm text-outline">Recorded transactions and breakdown across payment methods</p></div><div class="text-right"><p class="text-label-sm font-label-sm text-outline">Total Sales Recorded</p><p class="text-headline-md font-headline-md font-bold text-primary font-mono">ETB 12,450.00</p></div></div>
<!-- KPI Pill Strip -->
<div class="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant mb-4 text-label-md font-label-md"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[18px]" data-icon="receipt_long">receipt_long</span><span class="text-on-surface font-semibold">37 Completed Sales Transactions</span></div><span class="text-label-sm font-label-sm text-outline font-medium">October 5, 2026</span></div>
<!-- Configured Payment Method Breakdown Table -->
<div class="overflow-x-auto border border-outline-variant rounded-lg"><table class="w-full text-left text-body-sm font-body-sm"><thead><tr class="bg-surface-container-low border-b border-outline-variant text-label-md text-outline"><th class="py-2.5 px-4 font-semibold">Payment Method</th><th class="py-2.5 px-4 font-semibold text-center">Transactions</th><th class="py-2.5 px-4 font-semibold text-right">Reconciled Amount</th></tr></thead><tbody class="divide-y divide-outline-variant"><tr class="hover:bg-surface-container/50"><td class="py-3 px-4 font-medium text-on-surface flex items-center gap-2.5"><span class="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]" data-icon="payments">payments</span></span><span class="">Cash</span></td><td class="py-3 px-4 text-center font-mono text-on-surface-variant">22 txns</td><td class="py-3 px-4 text-right font-bold text-on-surface font-mono">ETB 7,200.00</td></tr><tr class="hover:bg-surface-container/50"><td class="py-3 px-4 font-medium text-on-surface flex items-center gap-2.5"><span class="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]" data-icon="account_balance">account_balance</span></span><span class="">Bank Transfer</span></td><td class="py-3 px-4 text-center font-mono text-on-surface-variant">11 txns</td><td class="py-3 px-4 text-right font-bold text-on-surface font-mono">ETB 3,750.00</td></tr><tr class="hover:bg-surface-container/50"><td class="py-3 px-4 font-medium text-on-surface flex items-center gap-2.5"><span class="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]" data-icon="smartphone">smartphone</span></span><span class="">Mobile Payment</span></td><td class="py-3 px-4 text-center font-mono text-on-surface-variant">4 txns</td><td class="py-3 px-4 text-right font-bold text-on-surface font-mono">ETB 1,500.00</td></tr><tr class="bg-surface-container-high/60 font-bold"><td class="py-2.5 px-4 text-on-surface" colspan="2">Total Payments Reconciled</td><td class="py-2.5 px-4 text-right text-primary font-mono text-headline-sm">ETB 12,450.00</td></tr></tbody></table></div>
</div>
<!-- 3. Cash Count & Discrepancy Reconciliation Card -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest border-amber-300"><div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-amber-600" data-icon="account_balance_wallet">account_balance_wallet</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Cash Reconciliation</h3></div><span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-amber-100 text-amber-900 font-semibold border border-amber-300"><span class="material-symbols-outlined text-[16px] text-amber-700" data-icon="warning">warning</span>Variance Detected</span></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"><div class="p-3.5 bg-surface rounded-lg border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Expected Cash</p><p class="text-headline-md font-headline-md font-bold text-on-surface font-mono mt-1">ETB 7,200.00</p><p class="text-[11px] text-outline mt-1">Total cash recorded from sales</p></div><div class="p-3.5 bg-surface rounded-lg border border-outline-variant"><p class="text-label-sm font-label-sm text-outline">Actual Cash Counted</p><p class="text-headline-md font-headline-md font-bold text-on-surface font-mono mt-1">ETB 7,150.00</p><p class="text-[11px] text-outline mt-1">Counted by Dawit T.</p></div><div class="p-3.5 bg-rose-50/70 rounded-lg border border-rose-200"><p class="text-label-sm font-label-sm text-rose-800 font-semibold">Cash Discrepancy</p><p class="text-headline-md font-headline-md font-bold text-rose-700 font-mono mt-1">- ETB 50.00</p><p class="text-[11px] text-rose-800 font-medium mt-1">Shortage in physical count</p></div></div><div class="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant"><div class="flex items-center gap-2 mb-2 text-label-md font-label-md text-on-surface"><span class="material-symbols-outlined text-outline text-[18px]" data-icon="description">description</span><span class="font-semibold">Discrepancy Explanation:</span></div><div class="bg-surface-container-lowest p-3 rounded border border-outline-variant font-mono text-body-sm text-on-surface leading-relaxed">"Physical cash count was ETB 50 below the recorded cash total. Cash was counted twice and the difference was confirmed."</div><div class="flex items-center justify-between text-label-sm font-label-sm text-outline mt-2 px-1"><span class="">Submitted by Dawit T. at 6:45 PM</span><span class="text-emerald-700 font-medium">Explanation Provided</span></div></div></div>
<!-- 4. Validation & Pre-Closing Readiness Checks -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest"><div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-3"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" data-icon="verified">verified</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Closing Checks</h3></div><span class="text-label-sm font-label-sm text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">2 of 2 Required Checks Passed</span></div><div class="space-y-2.5"><div class="flex items-start gap-3 p-2.5 bg-surface rounded-lg border border-outline-variant"><span class="material-symbols-outlined text-emerald-600 mt-0.5" data-icon="check_circle">check_circle</span><div class="flex-1"><div class="flex items-center justify-between"><p class="text-label-md font-label-md text-on-surface font-semibold">All Sales Recorded</p><span class="text-label-sm font-label-sm text-emerald-700 font-semibold">Passed</span></div><p class="text-body-sm text-outline mt-0.5">37 of 37 sales entered for this business day. No pending draft sales.</p></div></div><div class="flex items-start gap-3 p-2.5 bg-surface rounded-lg border border-outline-variant"><span class="material-symbols-outlined text-emerald-600 mt-0.5" data-icon="cloud_done">cloud_done</span><div class="flex-1"><div class="flex items-center justify-between"><p class="text-label-md font-label-md text-on-surface font-semibold">Required Sync Completed</p><span class="text-label-sm font-label-sm text-emerald-700 font-semibold">Passed</span></div><p class="text-body-sm text-outline mt-0.5">Online — All synced. All local branch records synchronized with system.</p></div></div><div class="flex items-start gap-3 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant"><span class="material-symbols-outlined text-outline mt-0.5" data-icon="info">info</span><div class="flex-1"><div class="flex items-center justify-between"><p class="text-label-md font-label-md text-on-surface font-medium">Previous Day Status</p><span class="text-label-sm font-label-sm text-outline font-medium">Informational</span></div><p class="text-body-sm text-outline mt-0.5">Previous Day: October 4 closing was approved. (Note: An open previous day does not block today's operations).</p></div></div></div></div>
</div>
<!-- ============================================== -->
<!-- COLUMN 2: Owner Review, Actions & Audit (5 Cols) -->
<!-- ============================================== -->
<div class="xl:col-span-5 space-y-space-lg">
<!-- 1. Owner Review & Decision Action Card -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest border-primary/40 shadow-md"><div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[22px]" data-icon="admin_panel_settings">admin_panel_settings</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Owner Review</h3></div><span class="text-label-sm font-label-sm bg-primary-fixed text-primary px-2 py-0.5 rounded font-semibold">Owner Review Required</span></div><div class="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant mb-5"><p class="text-body-sm text-on-surface-variant leading-relaxed">Review the submitted closing, including sales totals, payment totals, cash count, and any discrepancy explanation.</p></div><div class="space-y-3 mb-5"><button class="w-full bg-primary hover:bg-[#0039cc] text-on-primary py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 text-headline-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"><span class="material-symbols-outlined text-[20px]" data-icon="check_circle">check_circle</span><span class="">Approve Closing</span></button><button class="w-full bg-surface-container-lowest hover:bg-rose-50 text-rose-700 border border-rose-300 py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-label-lg transition-colors cursor-pointer"><span class="material-symbols-outlined text-[20px]" data-icon="edit_note">edit_note</span><span class="">Reject — Correction Required</span></button></div><div class="pt-3 border-t border-outline-variant space-y-2.5" id="rejection-drawer"><label class="block text-label-md font-label-md text-on-surface font-semibold" for="rejection-reason">Reason for Rejection *</label><textarea class="w-full rounded border border-outline-variant text-body-sm p-2.5 bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" id="rejection-reason" placeholder="Explain what needs to be corrected before the closing can be resubmitted." rows="3"></textarea><p class="text-label-sm font-label-sm text-outline">Rejection reasons are permanently recorded and sent to the branch employee for recount/correction.</p><button class="w-full bg-rose-700 hover:bg-rose-800 text-white py-2 px-3 rounded text-label-md font-semibold transition-colors mt-2">Reject Closing</button></div></div>
<!-- 2. Submission & Review History (Audit Continuity) -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest"><div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-4"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-outline" data-icon="history">history</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Submission &amp; Review History</h3></div></div><div class="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant"><div class="relative"><span class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white"></span><div class="flex items-center justify-between"><span class="text-label-md font-label-md font-bold text-on-surface">Closing Submitted</span><span class="text-label-sm font-label-sm text-outline font-mono">6:45 PM</span></div><p class="text-body-sm text-on-surface-variant mt-0.5">Submitted by Dawit T. Actual Cash: ETB 7,150.00, Discrepancy: -ETB 50.00 with explanation.</p></div></div><div class="mt-5 pt-3 border-t border-outline-variant text-[11px] text-outline flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]" data-icon="lock_clock">lock_clock</span><span class="">Submission and review history is preserved. Corrections create new records rather than overwriting.</span></div></div>
<!-- 3. Recent Branch Closings (Quick Reference Table) -->
<div class="surface-card rounded-xl p-space-md bg-surface-container-lowest"><div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-3"><div><h3 class="text-headline-sm font-headline-sm text-on-surface">Branch Closing Status</h3><p class="text-label-sm font-label-sm text-outline">Business Date: October 5, 2026</p></div><button class="text-primary hover:underline text-label-sm font-semibold">View All</button></div><div class="overflow-x-auto"><table class="w-full text-left text-body-sm font-body-sm"><thead><tr class="text-label-sm text-outline border-b border-outline-variant pb-1"><th class="py-2 font-semibold">Branch</th><th class="py-2 text-right font-semibold">Sales Total</th><th class="py-2 text-right font-semibold">Cash Discrepancy</th><th class="py-2 text-right font-semibold">Closing Status</th></tr></thead><tbody class="divide-y divide-outline-variant"><tr class="bg-primary-fixed/30 font-medium"><td class="py-2.5 font-bold text-primary flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Branch 1</td><td class="py-2.5 text-right font-mono text-on-surface">ETB 12,450.00</td><td class="py-2.5 text-right font-mono text-rose-700 font-bold">-50.00</td><td class="py-2.5 text-right"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Submitted — Awaiting Approval</span></td></tr><tr class="hover:bg-surface-container/40"><td class="py-2.5 text-on-surface font-medium">Branch 2</td><td class="py-2.5 text-right font-mono text-on-surface">ETB 9,820.00</td><td class="py-2.5 text-right font-mono text-outline">0.00</td><td class="py-2.5 text-right"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span></td></tr><tr class="hover:bg-surface-container/40"><td class="py-2.5 text-on-surface font-medium">Branch 3</td><td class="py-2.5 text-right font-mono text-on-surface">ETB 6,400.00</td><td class="py-2.5 text-right font-mono text-outline">—</td><td class="py-2.5 text-right"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-outline-variant">Not Submitted</span></td></tr></tbody></table></div><div class="mt-3 text-[11px] text-outline text-right">Branch 2 approved by Abebe G. at 6:15 PM</div></div>
</div>
</div>
</main>
<!-- Operational Sticky Bottom Summary Bar -->

</div>


</body></html>




#Transfer Details 


<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Transfer Details - Gelana Management System</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "inverse-on-surface": "#ecf0ff",
            "on-primary-fixed": "#001257",
            "outline-variant": "#c4c5da",
            "on-surface-variant": "#434657",
            "secondary": "#625e51",
            "surface-container": "#e8eefe",
            "on-secondary-container": "#666255",
            "on-error": "#ffffff",
            "inverse-primary": "#b9c3ff",
            "on-secondary-fixed": "#1e1c12",
            "primary-container": "#0047ff",
            "surface-container-highest": "#dde2f3",
            "surface-container-low": "#f1f3ff",
            "tertiary-fixed-dim": "#ffb4a2",
            "tertiary-fixed": "#ffdad2",
            "on-primary-fixed-variant": "#0033c0",
            "surface-dim": "#d4daea",
            "primary-fixed-dim": "#b9c3ff",
            "tertiary-container": "#b82800",
            "surface": "#f9f9ff",
            "on-background": "#161c27",
            "primary-fixed": "#dde1ff",
            "on-tertiary": "#ffffff",
            "background": "#f9f9ff",
            "on-primary": "#ffffff",
            "surface-tint": "#0046fa",
            "on-primary-container": "#d4d9ff",
            "surface-bright": "#f9f9ff",
            "surface-container-high": "#e3e8f9",
            "error-container": "#ffdad6",
            "primary": "#0035c5",
            "on-error-container": "#93000a",
            "on-secondary-fixed-variant": "#4a473b",
            "on-tertiary-fixed": "#3d0700",
            "surface-variant": "#dde2f3",
            "secondary-fixed-dim": "#ccc6b6",
            "tertiary": "#8d1c00",
            "on-tertiary-fixed-variant": "#8a1c00",
            "inverse-surface": "#2a303d",
            "on-secondary": "#ffffff",
            "error": "#ba1a1a",
            "secondary-fixed": "#e9e2d2",
            "secondary-container": "#e6dfcf",
            "on-surface": "#161c27",
            "surface-container-lowest": "#ffffff",
            "outline": "#747688",
            "on-tertiary-container": "#ffd1c6"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "gutter-mobile": "0.75rem",
            "space-xs": "0.25rem",
            "gutter": "1.25rem",
            "space-sm": "0.5rem",
            "space-xl": "2rem",
            "margin-mobile": "1rem",
            "margin": "2rem",
            "space-lg": "1.5rem",
            "space-md": "1rem"
          },
          "fontFamily": {
            "body-lg": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      vertical-align: middle;
    }
    .custom-scroll::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .custom-scroll::-webkit-scrollbar-track {
      background: #F1F3FF;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-row">
<!-- LEFT SIDEBAR NAVIGATION (11-Item Owner Hierarchy) -->
<aside class="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30 shrink-0">
<div class="p-4 flex flex-col h-full overflow-y-auto custom-scroll">
<!-- Brand Logo Header -->
<div class="flex items-center gap-3 px-2 py-3 mb-4">
<img alt="Gelana Stationery Logo" class="w-10 h-10 rounded-lg object-cover border border-outline-variant/40 shadow-xs" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW1UoWhbhqyrfrt4mJd-Uc5WYUHo_Thhhg6Yxs_AG4OlF7fsk67rXr0R9R6YYnIRM17k5-rmcb14p8yB63VzEMDNPpvWklLROPqQZPY0jHLjyVg7nVTn4h4PUU4vKST5wpPGu_2jv0DTMNcOb1RdMFw4SPX_m6XZNytzvphGds30GZqhjeAL4RgSviiz567XAO03_F4ElLD9fOnf2D-WVaiPgAkoFyp85dCmKQYHkPoNLt2__6r6jYV_BGxqECIv9M">
<div class="flex flex-col">
<span class="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight tracking-tight">Gelana Stationery</span>
<span class="text-label-sm font-label-sm text-on-surface-variant font-medium">Inventory &amp; Sales</span>
</div>
</div>
<!-- 11 Main Navigation Links -->
<nav class="space-y-1">
<!-- 1. Dashboard -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="dashboard">dashboard</span>
<span class="text-label-lg font-label-lg">Dashboard</span>
</a>
<!-- 2. Sales -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="point_of_sale">point_of_sale</span>
<span class="text-label-lg font-label-lg">Sales</span>
</a>
<!-- 3. Inventory -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="inventory_2">inventory_2</span>
<span class="text-label-lg font-label-lg">Inventory</span>
</a>
<!-- 4. Transfers (ACTIVE) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded bg-primary-fixed text-primary font-semibold border-l-4 border-primary transition-all" href="#">
<span class="material-symbols-outlined text-[20px] text-primary" data-icon="sync_alt" data-weight="fill" style="font-variation-settings: 'FILL' 1;">sync_alt</span>
<span class="text-label-lg font-label-lg text-primary font-bold">Transfers</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="category">category</span>
<span class="text-label-lg font-label-lg">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="local_shipping">local_shipping</span>
<span class="text-label-lg font-label-lg">Suppliers</span>
</a>
<!-- 7. Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="lock_clock">lock_clock</span>
<span class="text-label-lg font-label-lg">Daily Closing</span>
</a>
<!-- 8. Reports -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="bar_chart">bar_chart</span>
<span class="text-label-lg font-label-lg">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="badge">badge</span>
<span class="text-label-lg font-label-lg">Users &amp; Branches</span>
</a>
<!-- 10. Notifications -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
<span class="text-label-lg font-label-lg flex-1">Notifications</span>
<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">3</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
<span class="text-label-lg font-label-lg">Settings</span>
</a>
</nav>
</div>
</aside>
<!-- MAIN CANVAS & HEADER WRAPPER -->
<div class="pl-64 flex-1 flex flex-col min-w-0 bg-background">
<!-- TOP NAVIGATION BAR -->
<header class="sticky top-0 w-full z-20 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-14 px-gutter flex items-center justify-between">
<!-- Breadcrumb Cluster -->
<nav class="flex items-center gap-2 text-label-sm font-label-sm">
<a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Transfers</a>
<span class="text-outline-variant">/</span>
<a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Transfer History</a>
<span class="text-outline-variant">/</span>
<span class="text-primary font-semibold">TRF-000018</span>
</nav>
<!-- Center System Sync Status Indicator -->
<div class="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#EBF8F1] border border-[#A6E9C5]/50">
<span class="w-2 h-2 rounded-full bg-[#0D824C] animate-pulse"></span>
<span class="text-label-sm font-label-sm text-[#0D824C] font-semibold">Online — All synced</span>
</div>
<!-- Trailing Controls: Branch Switcher, Notification, Profile -->
<div class="flex items-center gap-4">
<!-- Branch Indicator Tag -->
<div class="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high rounded text-label-sm font-label-sm text-on-surface font-semibold border border-outline-variant/60">
<span class="material-symbols-outlined text-[16px] text-on-surface-variant" data-icon="store">store</span>
<span class="">Branch 1</span>
</div>
<!-- Notification Bell Icon with Badge -->
<button class="relative p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
<span class="absolute top-1 right-1 w-2 h-2 bg-[#D92D20] rounded-full"></span>
</button>
<!-- Help Action -->

<div class="h-5 w-px bg-outline-variant"></div>
<!-- Authenticated Owner Profile Cluster -->
<div class="flex items-center gap-2.5 pl-1">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shadow-xs">
            AG
          </div>
<div class="flex flex-col text-left">
<span class="text-label-md font-label-md text-on-surface leading-tight font-bold">Abebe G.</span>
<span class="text-label-sm font-label-sm text-primary font-medium">Owner</span>
</div>
<span class="material-symbols-outlined text-[16px] text-on-surface-variant" data-icon="expand_more">expand_more</span>
</div>
</div>
</header>
<!-- CONTENT WORKSPACE -->
<main class="p-margin space-y-space-lg max-w-7xl w-full mx-auto pb-16">
<!-- 1. PAGE HEADER SECTION -->
<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
<div><a class="inline-flex items-center gap-1.5 text-label-md font-label-md text-primary font-bold hover:underline mb-1 transition-all" href="#"><span class="material-symbols-outlined text-[16px]" data-icon="arrow_back">arrow_back</span>Back to Transfers</a><div class="flex flex-wrap items-center gap-3"><h1 class="text-headline-lg font-headline-lg text-on-surface">Transfer Details</h1><span class="px-2.5 py-0.5 rounded text-label-sm font-label-sm font-bold bg-surface-container-high text-on-surface border border-outline-variant">TRF-000018</span><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm font-bold bg-[#FEF9C3] text-[#A16207] border border-[#E5DCBE]"><span class="w-2 h-2 rounded-full bg-[#A16207]"></span>Received — Discrepancy</span></div><p class="text-body-md font-body-md text-on-surface-variant mt-1">Review the transfer request, movement, received quantities, and any discrepancy.</p></div>
<!-- State-aware Owner Action Group -->
<div class="flex items-center gap-2.5 shrink-0 self-start"><button class="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-on-primary hover:bg-[#0039CC] text-label-md font-label-md transition-colors shadow-sm"><span class="material-symbols-outlined text-[18px]" data-icon="assignment_late">assignment_late</span>Review Discrepancy</button></div>
</div>
<!-- 2. TRANSFER DIRECTION & SUMMARY CARD -->
<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"><div class="lg:col-span-5 bg-surface-container-low rounded-lg p-4 border border-outline-variant/60 flex items-center justify-between gap-4"><div class="flex flex-col items-start min-w-[110px]"><span class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Source Branch</span><div class="flex items-center gap-1.5 mt-0.5"><span class="material-symbols-outlined text-primary text-[20px]" data-icon="storefront">storefront</span><span class="text-headline-sm font-headline-sm text-on-surface font-bold">Branch 1</span></div></div><div class="flex-1 flex flex-col items-center px-2"><div class="w-full flex items-center relative"><div class="h-0.5 w-full bg-primary/40"></div><div class="absolute left-1/2 -translate-x-1/2 bg-surface-container-lowest px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1 text-[11px] font-bold text-primary shadow-xs"><span class="">Branch 1 → Branch 2</span></div></div></div><div class="flex flex-col items-end min-w-[110px]"><span class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Destination Branch</span><div class="flex items-center gap-1.5 mt-0.5"><span class="text-headline-sm font-headline-sm text-on-surface font-bold">Branch 2</span><span class="material-symbols-outlined text-[#0D824C] text-[20px]" data-icon="store">store</span></div></div></div><div class="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x-0 sm:divide-x divide-outline-variant/40"><div class="pl-2"><span class="text-label-sm font-label-sm text-on-surface-variant">Transfer ID</span><p class="text-label-lg font-label-lg text-on-surface font-bold mt-0.5">TRF-000018</p></div><div class="sm:pl-4"><span class="text-label-sm font-label-sm text-on-surface-variant">Requested By</span><p class="text-label-md font-label-md text-on-surface font-semibold mt-0.5">Dawit T.</p><span class="text-label-sm font-label-sm text-on-surface-variant">Oct 5, 2:15 PM</span></div><div class="sm:pl-4"><span class="text-label-sm font-label-sm text-on-surface-variant">Approved By</span><p class="text-label-md font-label-md text-on-surface font-semibold mt-0.5">Abebe G.</p><span class="text-label-sm font-label-sm text-on-surface-variant">Oct 5, 3:00 PM</span></div><div class="sm:pl-4"><span class="text-label-sm font-label-sm text-on-surface-variant">Current State</span><p class="text-label-md font-label-md text-[#A16207] font-bold mt-0.5">Received — Discrepancy</p></div></div></div></section>
<!-- 3. HORIZONTAL LIFECYCLE PROGRESS STEPPER -->
<section class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><h2 class="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-4 font-bold">Transfer Progress</h2><div class="grid grid-cols-1 md:grid-cols-5 gap-3 relative"><div class="flex flex-col bg-surface-container-low/70 p-3 rounded border border-outline-variant/60 relative"><div class="flex items-center justify-between mb-2"><span class="w-6 h-6 rounded-full bg-[#0D824C] text-on-primary flex items-center justify-center text-label-sm font-bold shadow-xs"><span class="material-symbols-outlined text-[14px]" data-icon="check">check</span></span><span class="text-label-sm font-label-sm font-semibold text-[#0D824C]">Step 1</span></div><span class="text-label-lg font-label-lg font-bold text-on-surface">Requested</span><span class="text-label-sm font-label-sm text-on-surface-variant mt-0.5">Oct 5, 2:15 PM</span><p class="text-[11px] text-on-surface-variant mt-2 leading-snug">Transfer request submitted by Dawit T.</p></div><div class="flex flex-col bg-surface-container-low/70 p-3 rounded border border-outline-variant/60 relative"><div class="flex items-center justify-between mb-2"><span class="w-6 h-6 rounded-full bg-[#0D824C] text-on-primary flex items-center justify-center text-label-sm font-bold shadow-xs"><span class="material-symbols-outlined text-[14px]" data-icon="check">check</span></span><span class="text-label-sm font-label-sm font-semibold text-[#0D824C]">Step 2</span></div><span class="text-label-lg font-label-lg font-bold text-on-surface">Approved</span><span class="text-label-sm font-label-sm text-on-surface-variant mt-0.5">Oct 5, 3:00 PM</span><p class="text-[11px] text-on-surface-variant mt-2 leading-snug">Owner approved the requested quantities. Note: Approval does not move inventory.</p></div><div class="flex flex-col bg-surface-container-low/70 p-3 rounded border border-outline-variant/60 relative"><div class="flex items-center justify-between mb-2"><span class="w-6 h-6 rounded-full bg-[#0D824C] text-on-primary flex items-center justify-center text-label-sm font-bold shadow-xs"><span class="material-symbols-outlined text-[14px]" data-icon="check">check</span></span><span class="text-label-sm font-label-sm font-semibold text-[#0D824C]">Step 3</span></div><span class="text-label-lg font-label-lg font-bold text-on-surface">Dispatched</span><span class="text-label-sm font-label-sm text-on-surface-variant mt-0.5">Oct 5, 3:45 PM</span><p class="text-[11px] text-on-surface-variant mt-2 leading-snug">Source branch released stock. Branch 1 stock decreased and quantity moved in transit.</p></div><div class="flex flex-col bg-[#FFF8E7] p-3 rounded border-2 border-[#A16207] relative shadow-xs"><div class="flex items-center justify-between mb-2"><span class="w-6 h-6 rounded-full bg-[#A16207] text-white flex items-center justify-center text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]" data-icon="warning">warning</span></span><span class="text-label-sm font-label-sm font-bold text-[#A16207]">Step 4 · Active</span></div><span class="text-label-lg font-label-lg font-bold text-on-surface">Received</span><span class="text-label-sm font-label-sm text-on-surface-variant mt-0.5">Oct 5, 4:50 PM</span><p class="text-[11px] text-[#A16207] font-semibold mt-2 leading-snug">Destination branch recorded actual received quantity. Discrepancy noted.</p></div><div class="flex flex-col bg-surface-container-lowest p-3 rounded border border-dashed border-outline-variant opacity-70"><div class="flex items-center justify-between mb-2"><span class="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-label-sm font-bold">5</span><span class="text-label-sm font-label-sm font-semibold text-on-surface-variant">Step 5</span></div><span class="text-label-lg font-label-lg font-bold text-on-surface-variant">Completed</span><span class="text-label-sm font-label-sm text-on-surface-variant mt-0.5">Pending</span><p class="text-[11px] text-on-surface-variant mt-2 leading-snug">Transfer process finished.</p></div></div></section>
<!-- 4. TRANSFER ITEMS TABLE -->
<section class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden"><div class="p-space-md border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><h2 class="text-headline-sm font-headline-sm text-on-surface">Transfer Items</h2><p class="text-body-sm font-body-sm text-on-surface-variant">Itemized line items verifying request, authorization, physical dispatch, and receiving count.</p></div><div class="text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-primary" data-icon="inventory_2">inventory_2</span><span class=""><strong>3 Items</strong></span></div></div><div class="overflow-x-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"><th class="py-3 px-4">Product</th><th class="py-3 px-4">SKU</th><th class="py-3 px-4">Unit</th><th class="py-3 px-4 text-right">Requested</th><th class="py-3 px-4 text-right">Approved</th><th class="py-3 px-4 text-right">Dispatched</th><th class="py-3 px-4 text-right">Received</th><th class="py-3 px-4 text-center">Status</th></tr></thead><tbody class="divide-y divide-outline-variant/50 text-body-md font-body-md"><tr class="hover:bg-surface-container/40 transition-colors"><td class="py-3.5 px-4 font-bold text-on-surface">Double A A4 Paper 80gsm</td><td class="py-3.5 px-4 text-label-sm font-label-sm text-on-surface-variant font-mono">STA-PAP-001</td><td class="py-3.5 px-4 text-on-surface-variant">Ream</td><td class="py-3.5 px-4 text-right font-medium">20</td><td class="py-3.5 px-4 text-right font-medium">20</td><td class="py-3.5 px-4 text-right font-medium">20</td><td class="py-3.5 px-4 text-right font-bold text-on-surface">20</td><td class="py-3.5 px-4 text-center"><span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[#EBF8F1] text-[#0D824C]"><span class="material-symbols-outlined text-[13px]" data-icon="check">check</span> Complete · 20/20</span></td></tr><tr class="bg-[#FFF8E7]/60 hover:bg-[#FFF8E7] transition-colors border-l-4 border-l-[#A16207]"><td class="py-3.5 px-4"><div class="flex items-center gap-2"><span class="font-bold text-on-surface">Bic Cristal Medium Pen - Blue</span><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF9C3] text-[#A16207]">Flagged</span></div></td><td class="py-3.5 px-4 text-label-sm font-label-sm text-on-surface-variant font-mono">STA-WRI-044</td><td class="py-3.5 px-4 text-on-surface-variant">Piece</td><td class="py-3.5 px-4 text-right font-medium text-on-surface-variant">50</td><td class="py-3.5 px-4 text-right font-medium">40</td><td class="py-3.5 px-4 text-right font-medium">40</td><td class="py-3.5 px-4 text-right font-bold text-[#ba1a1a]">38</td><td class="py-3.5 px-4 text-center"><span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-bold bg-[#FEE4E2] text-[#D92D20]"><span class="material-symbols-outlined text-[13px]" data-icon="priority_high">priority_high</span> Discrepancy: -2 Pcs</span></td></tr><tr class="hover:bg-surface-container/40 transition-colors"><td class="py-3.5 px-4 font-bold text-on-surface">Kangaro Stapler 24/6</td><td class="py-3.5 px-4 text-label-sm font-label-sm text-on-surface-variant font-mono">STA-OFF-012</td><td class="py-3.5 px-4 text-on-surface-variant">Box</td><td class="py-3.5 px-4 text-right font-medium">10</td><td class="py-3.5 px-4 text-right font-medium">10</td><td class="py-3.5 px-4 text-right font-medium">10</td><td class="py-3.5 px-4 text-right font-bold text-on-surface">10</td><td class="py-3.5 px-4 text-center"><span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold bg-[#EBF8F1] text-[#0D824C]"><span class="material-symbols-outlined text-[13px]" data-icon="check">check</span> Complete · 10/10</span></td></tr></tbody></table></div><div class="bg-surface-container-low/60 px-4 py-3 border-t border-outline-variant flex items-center gap-2.5 text-body-sm font-body-sm text-on-surface-variant"><span class="material-symbols-outlined text-primary text-[18px] shrink-0" data-icon="verified_user">verified_user</span><span class="">Requested, approved, dispatched, and received quantities are preserved. Receiving count never overwrites dispatched quantity.</span></div></section>
<!-- 5. DISCREPANCY INVESTIGATION & EXPLANATION CARD (PROMINENT AMBER) -->
<section class="bg-[#FFF8E7] rounded-xl border border-[#E5DCBE] p-space-md shadow-xs"><div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DCBE]"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-lg bg-[#FEF9C3] border border-[#A16207]/30 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[#A16207] text-[24px]" data-icon="report_problem">report_problem</span></div><div><div class="flex items-center gap-2"><h3 class="text-headline-sm font-headline-sm text-on-surface font-bold">Transfer Discrepancy — Bic Cristal Medium Pen - Blue (STA-WRI-044)</h3></div><p class="text-body-sm font-body-sm text-[#666255] mt-0.5">Physical receiving count at Branch 2 does not match the quantity dispatched by Branch 1.</p></div></div><div class="flex items-center gap-3"><div class="px-3 py-1.5 bg-surface-container-lowest rounded border border-[#E5DCBE] text-center"><span class="text-[10px] text-on-surface-variant uppercase font-semibold block">Dispatched</span><span class="text-label-lg font-label-lg font-bold text-on-surface">40 Pcs</span></div><div class="px-3 py-1.5 bg-surface-container-lowest rounded border border-[#E5DCBE] text-center"><span class="text-[10px] text-on-surface-variant uppercase font-semibold block">Received</span><span class="text-label-lg font-label-lg font-bold text-on-surface">38 Pcs</span></div><div class="px-3 py-1.5 bg-[#FEE4E2] rounded border border-[#D92D20]/30 text-center"><span class="text-[10px] text-[#D92D20] uppercase font-bold block">Difference</span><span class="text-label-lg font-label-lg font-bold text-[#D92D20]">-2 Pcs</span></div></div></div><div class="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"><div class="md:col-span-8 bg-surface-container-lowest p-3.5 rounded-lg border border-[#E5DCBE]"><div class="flex items-center gap-2 mb-1"><span class="text-label-sm font-label-sm font-bold text-on-surface">Explanation:</span><span class="text-label-sm font-label-sm text-on-surface-variant">Reported by Dawit T.</span><span class="text-[11px] text-outline">• Oct 5, 2026 · 4:50 PM</span></div><p class="text-body-sm font-body-sm text-[#1E2430] italic leading-relaxed">"Carton seal was intact upon arrival, but package contained 38 individual pieces instead of 40. Physical count conducted twice. 2 pieces missing from inner pack."</p></div><div class="md:col-span-4 flex flex-col gap-2"><div class="flex items-center justify-between"><span class="text-label-sm font-label-sm font-bold text-[#A16207]">Status: Pending Owner Review</span></div><button class="w-full py-2 px-3 bg-primary text-on-primary rounded text-label-md font-label-md hover:bg-[#0039CC] transition-colors flex items-center justify-center gap-2 shadow-xs"><span class="material-symbols-outlined text-[16px]" data-icon="assignment_late">assignment_late</span>Review Discrepancy</button><span class="text-[11px] text-[#666255] text-center leading-tight">Discrepancy will not silently alter source stock. Preserved for Owner audit.</span></div></div></section>
<!-- 6. TWO-COLUMN OPERATIONAL DETAILS -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- LEFT COLUMN: Operational Records (7 cols) -->
<div class="lg:col-span-7 space-y-space-lg"><div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><div class="flex items-center justify-between pb-3 border-b border-outline-variant"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]" data-icon="unarchive">unarchive</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Dispatch Details</h3></div><span class="text-label-sm font-label-sm text-on-surface-variant">Completed Oct 5, 3:45 PM</span></div><div class="mt-3.5 space-y-3"><div class="grid grid-cols-2 gap-4 text-body-sm font-body-sm"><div><span class="text-label-sm font-label-sm text-on-surface-variant block">Dispatched By</span><span class="text-label-md font-label-md text-on-surface font-semibold">Samuel K.</span></div><div><span class="text-label-sm font-label-sm text-on-surface-variant block">Source Branch</span><span class="text-label-md font-label-md text-on-surface font-semibold">Branch 1</span></div></div><div class="bg-surface-container-low p-3 rounded border border-outline-variant/60"><p class="text-body-sm font-body-sm text-on-surface-variant font-medium">Branch 1 stock decreased by dispatched quantities:</p><div class="flex flex-wrap gap-2 mt-2"><span class="px-2 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm font-mono text-error font-semibold border border-outline-variant/40">-20 Reams (A4 Paper)</span><span class="px-2 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm font-mono text-error font-semibold border border-outline-variant/40">-40 Pcs (Bic Pens)</span><span class="px-2 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm font-mono text-error font-semibold border border-outline-variant/40">-10 Boxes (Stapler)</span></div></div></div></div><div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><div class="flex items-center justify-between pb-3 border-b border-outline-variant"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-[#0D824C] text-[20px]" data-icon="archive">archive</span><h3 class="text-headline-sm font-headline-sm text-on-surface">Receiving Details</h3></div><span class="text-label-sm font-label-sm text-on-surface-variant">Completed Oct 5, 4:50 PM</span></div><div class="mt-3.5 space-y-3"><div class="grid grid-cols-2 gap-4 text-body-sm font-body-sm"><div><span class="text-label-sm font-label-sm text-on-surface-variant block">Received By</span><span class="text-label-md font-label-md text-on-surface font-semibold">Dawit T.</span></div><div><span class="text-label-sm font-label-sm text-on-surface-variant block">Destination Branch</span><span class="text-label-md font-label-md text-on-surface font-semibold">Branch 2</span></div></div><div class="bg-surface-container-low p-3 rounded border border-outline-variant/60"><p class="text-body-sm font-body-sm text-on-surface-variant font-medium">Branch 2 stock increased by quantities actually received:</p><div class="flex flex-wrap gap-2 mt-2"><span class="px-2 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm font-mono text-[#0D824C] font-semibold border border-outline-variant/40">+20 Reams (A4 Paper)</span><span class="px-2 py-1 rounded bg-[#FEF9C3] text-label-sm font-label-sm font-mono text-[#A16207] font-bold border border-[#E5DCBE]">+38 Pcs (Bic Pens)</span><span class="px-2 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm font-mono text-[#0D824C] font-semibold border border-outline-variant/40">+10 Boxes (Stapler)</span></div></div></div></div></div>
<!-- RIGHT COLUMN: Audit Trail & Owner Intelligence (5 cols) -->
<div class="lg:col-span-5 space-y-space-lg"><div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><h3 class="text-headline-sm font-headline-sm text-on-surface mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]" data-icon="history">history</span>Transfer History</h3><div class="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50"><div class="relative"><div class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-lowest"></div><div class="flex items-baseline justify-between"><span class="text-label-md font-label-md text-on-surface font-bold">Transfer Requested</span><span class="text-[11px] text-on-surface-variant">2:15 PM</span></div><p class="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Dawit T. submitted a transfer request from Branch 2.</p></div><div class="relative"><div class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-lowest"></div><div class="flex items-baseline justify-between"><span class="text-label-md font-label-md text-on-surface font-bold">Transfer Approved</span><span class="text-[11px] text-on-surface-variant">3:00 PM</span></div><p class="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Abebe G. approved 40 units of Bic Pens and full quantities of paper and staplers.</p></div><div class="relative"><div class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0D824C] border-2 border-surface-container-lowest"></div><div class="flex items-baseline justify-between"><span class="text-label-md font-label-md text-on-surface font-bold">Stock Dispatched</span><span class="text-[11px] text-on-surface-variant">3:45 PM</span></div><p class="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Samuel K. dispatched items from Branch 1. Stock marked in transit.</p></div><div class="relative"><div class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#A16207] border-2 border-surface-container-lowest"></div><div class="flex items-baseline justify-between"><span class="text-label-md font-label-md text-[#A16207] font-bold">Stock Received &amp; Discrepancy Noted</span><span class="text-[11px] text-on-surface-variant">4:50 PM</span></div><p class="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Dawit T. recorded count at Branch 2. Discrepancy of -2 Pcs recorded with explanation.</p></div></div></div><div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs"><div class="flex items-center justify-between pb-2 border-b border-outline-variant"><span class="text-label-sm font-label-sm font-bold text-on-surface block">Estimated Cost Basis</span><span class="text-[11px] text-on-surface-variant font-medium">Owner view · Weighted Average Cost</span></div><div class="mt-3"><div class="flex items-baseline gap-2 mt-1"><span class="text-headline-lg font-headline-lg font-bold text-on-surface">ETB 7,850.00</span></div><p class="text-[12px] text-on-surface-variant mt-2 leading-relaxed">Cost valuation based on Weighted Average Cost at source branch.</p></div></div><div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-xs space-y-2.5"><span class="text-label-sm font-label-sm text-on-surface-variant font-bold uppercase tracking-wider block">Related Operational Views</span><a class="flex items-center justify-between p-2 rounded hover:bg-surface-container text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors border border-outline-variant/40" href="#"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary" data-icon="timeline">timeline</span>View Related Stock Movements</span><span class="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span></a><a class="flex items-center justify-between p-2 rounded hover:bg-surface-container text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors border border-outline-variant/40" href="#"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="storefront">storefront</span>Branch 1 Current Stock</span><span class="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span></a><a class="flex items-center justify-between p-2 rounded hover:bg-surface-container text-body-sm font-body-sm text-on-surface hover:text-primary transition-colors border border-outline-variant/40" href="#"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="store">store</span>Branch 2 Current Stock</span><span class="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span></a></div></div>
</div>
</main>
</div>


</body></html>




#New Receiving 



<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>New Receiving - Gelana Management System</title>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Plus Jakarta Sans Font -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS v3 with Plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration verbatim -->
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "surface-bright": "#f9f9ff",
            "surface-dim": "#d4daea",
            "tertiary-container": "#b82800",
            "on-tertiary-fixed": "#3d0700",
            "error-container": "#ffdad6",
            "surface-container-low": "#f1f3ff",
            "surface-container-lowest": "#ffffff",
            "on-secondary-container": "#666255",
            "tertiary-fixed": "#ffdad2",
            "on-primary-container": "#d4d9ff",
            "surface-tint": "#0046fa",
            "on-surface-variant": "#434657",
            "on-background": "#161c27",
            "outline-variant": "#c4c5da",
            "on-tertiary-container": "#ffd1c6",
            "on-secondary-fixed-variant": "#4a473b",
            "primary-fixed": "#dde1ff",
            "surface-container-highest": "#dde2f3",
            "secondary-fixed": "#e9e2d2",
            "secondary-container": "#e6dfcf",
            "secondary": "#625e51",
            "on-tertiary-fixed-variant": "#8a1c00",
            "on-error": "#ffffff",
            "tertiary": "#8d1c00",
            "inverse-on-surface": "#ecf0ff",
            "secondary-fixed-dim": "#ccc6b6",
            "error": "#ba1a1a",
            "background": "#f9f9ff",
            "on-surface": "#161c27",
            "tertiary-fixed-dim": "#ffb4a2",
            "on-primary-fixed-variant": "#0033c0",
            "surface-container-high": "#e3e8f9",
            "on-secondary": "#ffffff",
            "primary": "#0035c5",
            "primary-container": "#0047ff",
            "surface-variant": "#dde2f3",
            "on-error-container": "#93000a",
            "surface-container": "#e8eefe",
            "inverse-primary": "#b9c3ff",
            "primary-fixed-dim": "#b9c3ff",
            "inverse-surface": "#2a303d",
            "surface": "#f9f9ff",
            "on-primary-fixed": "#001257",
            "on-secondary-fixed": "#1e1c12",
            "on-primary": "#ffffff",
            "on-tertiary": "#ffffff",
            "outline": "#747688"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "gutter-mobile": "0.75rem",
            "margin-mobile": "1rem",
            "space-lg": "1.5rem",
            "space-sm": "0.5rem",
            "space-xs": "0.25rem",
            "margin": "2rem",
            "space-xl": "2rem",
            "space-md": "1rem",
            "gutter": "1.25rem"
          },
          "fontFamily": {
            "headline-sm": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"],
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
            "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
            "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
            "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "headline-xl-mobile": ["26px", { "lineHeight": "34px", "fontWeight": "700" }],
            "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }]
          }
        },
      },
    }
  </script>
<style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #f6f8fb;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      font-size: 20px;
      line-height: 1;
      display: inline-block;
    }
    .material-symbols-outlined.fill {
      font-variation-settings: 'FILL' 1;
    }
    /* Ambient micro-elevation per Style Guidance */
    .card-level-1 {
      background: #FFFFFF;
      border: 1px solid #E2E7EE;
      box-shadow: 0 1px 3px rgba(30, 36, 48, 0.04), 0 1px 2px rgba(30, 36, 48, 0.02);
    }
  </style>
</head>
<body class="bg-surface text-on-surface antialiased min-h-screen flex">
<!-- Side Navigation Bar (Anchored from JSON, active state mapped to Inventory) -->
<aside class="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30 shrink-0">
<div class="p-4 flex flex-col h-full">
<!-- Brand Logo & Header -->
<div class="flex items-center gap-3 px-2 py-3 mb-4">
<img alt="Gelana Stationery Logo" class="w-10 h-10 rounded-lg object-cover border border-outline-variant shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZBUMftXl3q2Hth1Tb0duG6CPpq5oHdxyrbuN7sL4Ex8up745969wUC49CwWH_zN2zXfl5UHrWIeHilBL8Plq9tOtMq1JLAlWXQfhv8glCLJnxi-u4kQFtt7KjVGEZGdlKz0frbyCbH0tm7HHuqtAJDLgoeZHyRYsmloHwk_w83k_mX2QzBdcq1ouUClvt67ecNiZ8hOnPxCj8IKRmwxP6xVYLdfkqVSk1ZehrRwJLsJ4-KbUHIp3ZkRengZggtkWe">
<div class="flex flex-col overflow-hidden">
<span class="text-headline-sm font-headline-sm font-bold text-on-surface truncate">Gelana Stationery</span>
<span class="text-body-sm font-body-sm text-on-surface-variant truncate">Inventory &amp; Sales</span>
</div>
</div>
<!-- Navigation Tabs (Exact 11 items as required) -->
<nav class="flex-1 space-y-1 overflow-y-auto pr-1">
<!-- 1. Dashboard -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<!-- 2. Sales -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="point_of_sale">point_of_sale</span>
<span class="text-label-md font-label-md">Sales</span>
</a>
<!-- 3. Inventory (ACTIVE - Mapped per instruction) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded bg-primary-fixed text-primary font-semibold border-l-4 border-primary transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined fill text-primary" data-icon="inventory_2" data-weight="fill" style="font-variation-settings: 'FILL' 1;">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<!-- 4. Transfers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="sync_alt">sync_alt</span>
<span class="text-label-md font-label-md">Transfers</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="category">category</span>
<span class="text-label-md font-label-md">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
<span class="text-label-md font-label-md">Suppliers</span>
</a>
<!-- 7. Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="lock_clock">lock_clock</span>
<span class="text-label-md font-label-md">Daily Closing</span>
</a>
<!-- 8. Reports -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
<span class="text-label-md font-label-md">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="badge">badge</span>
<span class="text-label-md font-label-md">Users &amp; Branches</span>
</a>
<!-- 10. Notifications -->
<a class="flex items-center justify-between px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="text-label-md font-label-md">Notifications</span>
</div>
<span class="px-1.5 py-0.2 bg-primary-container text-on-primary text-[10px] font-bold rounded-full">3</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
</nav>
<!-- Owner Profile Snippet in Drawer Bottom -->
<div class="pt-4 border-t border-outline-variant mt-2 flex items-center gap-3 px-2">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">AG</div>
<div class="flex flex-col overflow-hidden">
<span class="text-label-sm font-label-sm text-on-surface truncate">Abebe G.</span>
<span class="text-[10px] text-on-surface-variant font-medium">Owner (All Branches)</span>
</div>
</div>
</div>
</aside>
<!-- Main Canvas Container (Offset by SideNav w-64) -->
<div class="flex-1 ml-64 min-h-screen flex flex-col bg-[#F6F8FB]">
<!-- Top Application Bar (Standard component) -->
<header class="sticky top-0 z-20 h-14 bg-surface-container-lowest border-b border-outline-variant px-margin flex items-center justify-between">
<!-- Breadcrumb Hierarchy -->
<div class="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
<span class="">Inventory</span>
<span class="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
<span class="">Receiving</span>
<span class="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
<span class="text-primary font-semibold">New Receiving</span>
</div>
<!-- Trailing Status, Branch and Profile Controls -->
<div class="flex items-center gap-5">
<!-- Online sync state indicator -->
<div class="flex items-center gap-2 px-2.5 py-1 bg-[#EBF8F1] rounded-full border border-[#C6F0D6]">
<span class="w-2 h-2 rounded-full bg-[#0D824C] animate-pulse"></span>
<span class="text-label-sm font-label-sm text-[#0D824C]">Online — All synced</span>
</div>
<!-- Branch Selector / Indicator -->
<div class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded border border-outline-variant">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]">store</span>
<span class="text-label-md font-label-md text-on-surface">Branch 2</span>
<span class="text-[10px] text-on-surface-variant font-normal">(Owner view)</span>
</div>
<!-- Notification Bell Icon Button -->
<button class="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors" title="Notifications">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="absolute top-1 right-1 w-2 h-2 bg-[#D92D20] rounded-full"></span>
</button>
<!-- User Profile -->
<div class="flex items-center gap-2 pl-2 border-l border-outline-variant">
<div class="w-8 h-8 rounded-full bg-[#E8EEFE] border border-[#CBD5E1] flex items-center justify-center font-bold text-xs text-primary">
            AG
          </div>
<div class="flex flex-col text-left">
<span class="text-label-sm font-label-sm text-on-surface font-semibold leading-tight">Abebe G. (Owner)</span>
<span class="text-[10px] text-on-surface-variant leading-tight">Full Privileges</span>
</div>
</div>
</div>
</header>
<!-- Page Body Content Area -->
<main class="flex-1 p-margin space-y-space-lg max-w-7xl w-full mx-auto">
<!-- Page Header with Title & Top-Right Action -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">New Receiving</h1>
<p class="text-body-md font-body-md text-on-surface-variant mt-1">
            Record stock received from a supplier and add it to a branch inventory.
          </p>
</div>
<div class="flex items-center gap-3">
<button class="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px]">history</span>
<span class="">View Receiving History</span>
</button>
</div>
</div>
<!-- Main Layout Grid (Receiving Setup + Items Table & Summary) -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
<!-- Left / Core Flow: Configuration & Item Intake (8 cols desktop) -->
<div class="xl:col-span-8 space-y-space-lg">
<!-- Section 1: Receiving Context & Setup Card -->
<div class="card-level-1 rounded-xl p-space-md bg-surface-container-lowest">
<div class="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E7EE]">
<div class="flex items-center gap-2">
<span class="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">1</span>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Receiving Details</h2>
</div>

</div>
<!-- 4-Step Form Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<!-- Step 1: Destination Branch -->
<div>
<label class="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Destination Branch <span class="text-error">*</span>
</label>
<div class="relative">
<select class="w-full h-[38px] px-3 pr-8 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
<option selected="">Branch 2</option>
<option>Branch 1</option>
<option>Branch 3</option>
</select>
<span class="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
</div>
<p class="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">info</span> Stock will be added to this branch after confirmation.</p>
</div>
<!-- Step 2: Supplier Selection -->
<div>
<label class="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Supplier <span class="text-error">*</span>
</label>
<div class="relative">
<select class="w-full h-[38px] px-3 pr-8 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none">
<option selected="">Demo Stationery Supplies Ltd</option>
<option>Addis Paper &amp; Packaging PLC</option>
<option>Blue Nile Imports</option>
</select>
<span class="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
</div>
<div class="mt-1.5 flex items-center justify-between text-[11px] text-on-surface-variant">
<span class="">Contact: Almaz B. | Addis Ababa</span>
<span class="font-medium text-secondary">One supplier per receiving transaction.</span>
</div>
</div>
<!-- Step 3: Receiving Date -->
<div>
<label class="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Receiving Date <span class="text-error">*</span>
</label>
<div class="relative">
<input class="w-full h-[38px] px-3 pl-9 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" type="text" value="Oct 5, 2026">
<span class="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[18px]">calendar_today</span>
</div>
<p class="text-[11px] text-on-surface-variant mt-1.5">Defaulted to current business day.</p>
</div>
<!-- Step 4: Supplier Invoice / Reference Number -->
<div>
<label class="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Supplier Invoice / Ref Number <span class="text-on-surface-variant font-normal">(Optional)</span>
</label>
<div class="relative">
<input class="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. INV-98214" type="text" value="INV-2026-8819">
</div>
<p class="text-[11px] text-on-surface-variant mt-1.5">Optional supplier reference for your records.</p>
</div>
</div>
</div>
<!-- Section 2: Product Search & Intake Section -->
<div class="card-level-1 rounded-xl p-space-md bg-surface-container-lowest">
<div class="flex items-center gap-2 mb-3">
<span class="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">2</span>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Product Intake</h2>
</div>
<!-- Search input without scanner icons -->
<div class="relative mb-3">
<span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
<input class="w-full h-[40px] pl-10 pr-4 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Search products by name or SKU to add..." type="text">
</div>
<!-- Instant catalog suggestions preview (Clean high-density row) -->

</div>
<!-- Section 3: Receiving Items Table -->
<div class="card-level-1 rounded-xl overflow-hidden bg-surface-container-lowest">
<div class="p-space-md flex items-center justify-between border-b border-[#E2E7EE]">
<div class="flex items-center gap-3">
<h3 class="text-headline-sm font-headline-sm text-on-surface">Receiving Items</h3>
<span class="px-2.5 py-0.5 text-label-sm font-label-sm rounded-full bg-[#EBF8F1] text-[#0D824C]">3 Products Added</span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant">Currency: Ethiopian Birr (ETB)</span>
</div>
<!-- Strict Tabular Layout -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-[#F8FAFC] border-b border-[#E2E7EE]">
<th class="py-2.5 px-4 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider">Product Details</th>
<th class="py-2.5 px-3 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider">SKU</th>
<th class="py-2.5 px-3 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider">Unit</th>
<th class="py-2.5 px-3 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider w-28">Quantity</th>
<th class="py-2.5 px-3 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider w-36">Purchase Cost</th>
<th class="py-2.5 px-3 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider text-right">Line Total</th>
<th class="py-2.5 px-4 text-label-sm font-label-sm text-[#64748B] uppercase tracking-wider text-center w-12">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-[#E2E7EE]">
<!-- Row 1: Double A A4 Paper -->
<tr class="hover:bg-[#F8FAFC] transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-on-surface text-body-md font-body-md">Double A A4 Paper 80gsm</div>
<div class="text-[11px] text-on-surface-variant">Paper &amp; Media</div>
</td>
<td class="py-3 px-3 text-body-sm font-body-sm font-mono text-on-surface">STA-PAP-001</td>
<td class="py-3 px-3 text-body-sm font-body-sm text-on-surface">Ream</td>
<td class="py-3 px-3">
<input class="w-20 h-[34px] px-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right" type="number" value="20">
</td>
<td class="py-3 px-3">
<div class="relative">
<span class="absolute left-2 top-2 text-xs text-on-surface-variant">ETB</span>
<input class="w-32 h-[34px] pl-9 pr-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right font-mono" type="text" value="450.00">
</div>
</td>
<td class="py-3 px-3 text-right font-semibold text-on-surface text-body-md font-body-md font-mono">
                      ETB 9,000.00
                    </td>
<td class="py-3 px-4 text-center">
<button class="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded transition-colors" title="Remove Item" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</td>
</tr>
<!-- Row 2: Bic Cristal Medium Pen -->
<tr class="hover:bg-[#F8FAFC] transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-on-surface text-body-md font-body-md">Bic Cristal Medium Pen - Blue</div>
<div class="text-[11px] text-on-surface-variant">Writing Instruments</div>
</td>
<td class="py-3 px-3 text-body-sm font-body-sm font-mono text-on-surface">STA-WRI-044</td>
<td class="py-3 px-3 text-body-sm font-body-sm text-on-surface">Piece <span class="text-[10px] text-on-surface-variant block">(1 Box = 50 Pcs)</span></td>
<td class="py-3 px-3">
<input class="w-20 h-[34px] px-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right" type="number" value="100">
</td>
<td class="py-3 px-3">
<div class="relative">
<span class="absolute left-2 top-2 text-xs text-on-surface-variant">ETB</span>
<input class="w-32 h-[34px] pl-9 pr-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right font-mono" type="text" value="12.50">
</div>
</td>
<td class="py-3 px-3 text-right font-semibold text-on-surface text-body-md font-body-md font-mono">
                      ETB 1,250.00
                    </td>
<td class="py-3 px-4 text-center">
<button class="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded transition-colors" title="Remove Item" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</td>
</tr>
<!-- Row 3: Kangaro Stapler 24/6 -->
<tr class="hover:bg-[#F8FAFC] transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-on-surface text-body-md font-body-md">Kangaro Stapler 24/6</div>
<div class="text-[11px] text-on-surface-variant">Office Supplies</div>
</td>
<td class="py-3 px-3 text-body-sm font-body-sm font-mono text-on-surface">STA-OFF-012</td>
<td class="py-3 px-3 text-body-sm font-body-sm text-on-surface">Box</td>
<td class="py-3 px-3">
<input class="w-20 h-[34px] px-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right" type="number" value="15">
</td>
<td class="py-3 px-3">
<div class="relative">
<span class="absolute left-2 top-2 text-xs text-on-surface-variant">ETB</span>
<input class="w-32 h-[34px] pl-9 pr-2.5 rounded border border-outline-variant text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right font-mono" type="text" value="180.00">
</div>
</td>
<td class="py-3 px-3 text-right font-semibold text-on-surface text-body-md font-body-md font-mono">
                      ETB 2,700.00
                    </td>
<td class="py-3 px-4 text-center">
<button class="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded transition-colors" title="Remove Item" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Informational Banner below table (Weighted Average Cost valuation note) -->
<div class="p-3 bg-[#FFF8E7] border-t border-[#E5DCBE] flex items-start gap-2.5 text-body-sm font-body-sm text-on-surface">
<span class="material-symbols-outlined text-[#A16207] text-[18px] shrink-0 mt-0.5">verified_user</span>
<p class="text-xs text-[#4A473B] leading-relaxed"><strong class="font-semibold text-on-surface">Valuation Notice:</strong> Purchase cost is preserved with this receiving record and used for inventory costing.</p>
</div>
</div>
</div>
<!-- Right Core: Summary & Confirmation Card (4 cols desktop) -->
<div class="xl:col-span-4 space-y-space-md">
<!-- Summary Card -->
<div class="card-level-1 rounded-xl p-space-md bg-surface-container-lowest sticky top-20">
<h3 class="text-headline-sm font-headline-sm text-on-surface pb-3 border-b border-[#E2E7EE]">Receiving Summary</h3>
<!-- Summary KPI Block -->
<div class="py-4 space-y-3"><div class="flex items-center justify-between text-body-md font-body-md"><span class="text-on-surface-variant">Products / Line Items</span><span class="font-bold text-on-surface text-base">3</span></div><div class="flex items-center justify-between text-body-md font-body-md pt-2 border-t border-[#E2E7EE]"><span class="text-on-surface font-semibold">Total Purchase Cost</span><span class="font-extrabold text-primary text-xl font-mono">ETB 12,950.00</span></div></div>
<!-- Destination Notice -->
<div class="my-3 p-3 bg-surface-container-low rounded border border-outline-variant flex items-center gap-2.5"><span class="material-symbols-outlined text-primary text-[20px]">store</span><div class="text-xs"><span class="font-semibold text-on-surface block">Destination: Branch 2</span><span class="text-on-surface-variant">Stock will be added to Branch 2 inventory after confirmation.</span></div></div>
<!-- Review Notice Note -->
<div class="mb-5 p-3 bg-[#F6F8FB] border border-[#E2E7EE] rounded text-[11px] text-on-surface-variant leading-relaxed">Confirming this receiving will add the recorded quantities to Branch 2 inventory and create a receiving record.</div>
<!-- Action Buttons -->
<div class="space-y-2.5">
<button class="w-full h-11 bg-primary-container hover:bg-[#0039CC] text-on-primary text-label-lg font-label-lg rounded font-semibold transition-all shadow-sm flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined text-[20px]">inventory</span>
<span class="">Confirm Receiving</span>
</button>
<button class="w-full h-9 bg-transparent hover:bg-surface-container text-on-surface-variant text-label-md font-label-md rounded border border-outline-variant transition-colors flex items-center justify-center" type="button">Clear Receiving</button>
</div>
<!-- Quick Audit Metadata -->

</div>
</div>
</div>
</main>
</div>


</body></html>




#Reports 



<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Reports — Gelana Stationery Inventory &amp; Sales</title>
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "on-secondary-container": "#666255",
            "surface": "#f9f9ff",
            "surface-container": "#e8eefe",
            "on-primary-fixed-variant": "#0033c0",
            "surface-bright": "#f9f9ff",
            "on-primary": "#ffffff",
            "surface-container-low": "#f1f3ff",
            "surface-container-highest": "#dde2f3",
            "secondary-fixed-dim": "#ccc6b6",
            "surface-dim": "#d4daea",
            "secondary-container": "#e6dfcf",
            "tertiary-fixed-dim": "#ffb4a2",
            "on-primary-container": "#d4d9ff",
            "secondary": "#625e51",
            "surface-container-lowest": "#ffffff",
            "on-tertiary-fixed": "#3d0700",
            "tertiary-container": "#b82800",
            "surface-tint": "#0046fa",
            "on-error": "#ffffff",
            "inverse-on-surface": "#ecf0ff",
            "on-tertiary-fixed-variant": "#8a1c00",
            "on-secondary-fixed": "#1e1c12",
            "outline-variant": "#c4c5da",
            "on-tertiary": "#ffffff",
            "tertiary-fixed": "#ffdad2",
            "error-container": "#ffdad6",
            "primary-fixed": "#dde1ff",
            "secondary-fixed": "#e9e2d2",
            "primary": "#0035c5",
            "surface-container-high": "#e3e8f9",
            "tertiary": "#8d1c00",
            "error": "#ba1a1a",
            "inverse-surface": "#2a303d",
            "on-surface-variant": "#434657",
            "on-tertiary-container": "#ffd1c6",
            "primary-container": "#0047ff",
            "on-error-container": "#93000a",
            "on-secondary-fixed-variant": "#4a473b",
            "outline": "#747688",
            "on-background": "#161c27",
            "primary-fixed-dim": "#b9c3ff",
            "background": "#f9f9ff",
            "on-secondary": "#ffffff",
            "on-surface": "#161c27",
            "surface-variant": "#dde2f3",
            "on-primary-fixed": "#001257",
            "inverse-primary": "#b9c3ff"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "space-lg": "1.5rem",
            "gutter-mobile": "0.75rem",
            "space-xs": "0.25rem",
            "gutter": "1.25rem",
            "space-md": "1rem",
            "space-xl": "2rem",
            "margin-mobile": "1rem",
            "margin": "2rem",
            "space-sm": "0.5rem"
          },
          "fontFamily": {
            "headline-xl-mobile": ["Plus Jakarta Sans"],
            "headline-sm": ["Plus Jakarta Sans"],
            "body-md": ["Plus Jakarta Sans"],
            "headline-md": ["Plus Jakarta Sans"],
            "body-sm": ["Plus Jakarta Sans"],
            "label-sm": ["Plus Jakarta Sans"],
            "label-lg": ["Plus Jakarta Sans"],
            "label-md": ["Plus Jakarta Sans"],
            "headline-xl": ["Plus Jakarta Sans"],
            "headline-lg": ["Plus Jakarta Sans"],
            "body-lg": ["Plus Jakarta Sans"]
          },
          "fontSize": {
            "headline-xl-mobile": ["26px", {"lineHeight": "34px", "fontWeight": "700"}],
            "headline-sm": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
            "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
            "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
            "body-sm": ["12px", {"lineHeight": "18px", "fontWeight": "400"}],
            "label-sm": ["11px", {"lineHeight": "14px", "fontWeight": "600"}],
            "label-lg": ["14px", {"lineHeight": "20px", "fontWeight": "600"}],
            "label-md": ["12px", {"lineHeight": "16px", "fontWeight": "600"}],
            "headline-xl": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
            "headline-lg": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
            "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
          }
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      font-size: 19px;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .custom-scroll::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background-color: #dde2f3;
      border-radius: 4px;
    }
    .custom-scroll::-webkit-scrollbar-track {
      background-color: transparent;
    }
  </style>
</head>
<body class="bg-background text-on-surface antialiased font-body-md min-h-screen flex selection:bg-primary selection:text-on-primary">
<!-- LEFT FIXED SIDEBAR NAVIGATION (Matching Shared Components JSON & Design System) -->
<aside class="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-50">
<div class="p-4 flex flex-col h-full overflow-hidden">
<!-- Brand Logo / Header -->
<div class="flex items-center gap-3 px-2 pb-4 mb-2 border-b border-outline-variant"><div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant bg-surface-container-lowest flex items-center justify-center p-0.5"><img alt="Gelana Stationery Logo" class="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8xQsDzXd5_F5RR1XPrK1_ZYdE2t-_c3IiesunU6EDmCi13km5PO-ZdoYAVxUzSDYnLox489Pnh1JXjqCjI7VaUjO-WR8xbEwhnjdWqBuz1-Oolakx6QHB65YyQf5TTLjZg_3R6mduVh1GbBJlmu80z_yWXdCIi7qZaG-N3S31TMLnCQYTdSlov4DF71MdToQFNbbE29ANk0gYUDO4bHqufakRW66_oFP1aIb0haSoiEyy8HST8P7bo1hxNMvdBLBg"></div><div class="flex flex-col min-w-0"><span class="text-headline-sm font-headline-sm font-bold text-on-surface truncate">Gelana Stationery</span><span class="text-label-sm font-label-sm text-on-surface-variant font-medium">Inventory &amp; Sales</span></div></div>
<!-- Main Navigation Menu Items (From JSON: Active state mapped to Reports) -->
<nav class="flex-1 overflow-y-auto space-y-1 custom-scroll pr-1">
<!-- 1. Dashboard -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<!-- 2. Sales -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="point_of_sale">point_of_sale</span>
<span class="text-label-md font-label-md">Sales</span>
</a>
<!-- 3. Inventory -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<!-- 4. Transfers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="sync_alt">sync_alt</span>
<span class="text-label-md font-label-md">Transfers</span>
</a>
<!-- 5. Products & Categories -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="category">category</span>
<span class="text-label-md font-label-md truncate">Products &amp; Categories</span>
</a>
<!-- 6. Suppliers -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
<span class="text-label-md font-label-md">Suppliers</span>
</a>
<!-- 7. Daily Closing -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="lock_clock">lock_clock</span>
<span class="text-label-md font-label-md">Daily Closing</span>
</a>
<!-- 8. Reports (ACTIVE ITEM via JSON rules) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded bg-primary-fixed text-primary font-semibold border-l-4 border-primary transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined text-primary" data-icon="bar_chart" style="font-variation-settings: 'FILL' 1;">bar_chart</span>
<span class="text-label-md font-label-md">Reports</span>
</a>
<!-- 9. Users & Branches -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="badge">badge</span>
<span class="text-label-md font-label-md">Users &amp; Branches</span>
</a>
<!-- 10. Notifications -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="text-label-md font-label-md">Notifications</span>
</a>
<!-- 11. Settings -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface transition-all duration-150 ease-in-out cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
</nav>
<!-- Bottom Profile & Status (Abebe G. Owner) -->
<div class="pt-3 border-t border-outline-variant mt-2">
<div class="flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface-container-low mb-2 border border-outline-variant/60"><div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-600"></span><span class="text-label-sm font-label-sm text-emerald-800 font-medium">Online — All synced</span></div></div>
<div class="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-md shrink-0">
            AG
          </div>
<div class="flex flex-col min-w-0">
<span class="text-label-md font-label-md text-on-surface truncate">Abebe G. (Owner)</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">Full Privileges</span>
</div>
<span class="material-symbols-outlined ml-auto text-outline" data-icon="more_vert">more_vert</span>
</div>
</div>
</div>
</aside>
<!-- MAIN VIEWPORT CONTAINER -->
<div class="flex-1 ml-64 flex flex-col min-w-0 bg-background">
<!-- TOP NAVIGATION BAR (Matching Shared Components JSON) -->
<header class="sticky top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-14 px-gutter flex justify-between items-center">
<!-- Search on left & Breadcrumbs -->
<div class="flex items-center gap-6">
<div class="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant">
<span class="material-symbols-outlined text-outline" data-icon="home">home</span>
<span class="text-outline">/</span>
<span class="text-primary font-semibold">Reports</span>
</div>
<div class="relative w-72">
<span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input class="w-full pl-9 pr-3 py-1.5 text-body-sm bg-surface-container-low border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface placeholder:text-outline" placeholder="Search report metrics, products..." type="text">
</div>
</div>
<!-- Trailing Status, Branch Context & Actions -->
<div class="flex items-center gap-4">
<!-- Sync Indicator -->
<div class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
<span class="w-2 h-2 rounded-full bg-emerald-600"></span>
<span class="text-label-sm font-label-sm text-emerald-800 font-medium">Online — All synced</span>
</div>
<!-- Branch Selector Context -->
<div class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-on-surface text-label-md font-label-md"><span class="material-symbols-outlined text-primary" data-icon="store">store</span><span class="">All Branches</span><span class="material-symbols-outlined text-outline" data-icon="arrow_drop_down">arrow_drop_down</span></div>
<!-- Action Icons -->
<div class="flex items-center gap-1">
<button class="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors relative" title="Notifications" type="button">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
</button>

</div>
<!-- Divider -->
<div class="h-6 w-px bg-outline-variant"></div>
<!-- User Chip -->
<div class="flex items-center gap-2">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-semibold text-label-sm shadow-sm">
            AG
          </div>
<div class="hidden xl:flex flex-col text-left">
<span class="text-label-md font-label-md text-on-surface leading-tight">Abebe G. (Owner)</span>
<span class="text-label-sm font-label-sm text-on-surface-variant leading-tight">Branch 1, 2, 3</span>
</div>
</div>
</div>
</header>
<!-- MAIN SCROLLABLE CONTENT CANVAS -->
<main class="p-gutter lg:p-margin space-y-6 max-w-7xl mx-auto w-full">
<!-- PAGE HEADER & PRIMARY ACTIONS -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
<div>
<h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">Reports</h1>
<p class="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Review sales, inventory, profit, and daily closing performance across the business.
          </p>
</div>
<!-- Header Actions: Export Dropdown & Refresh -->
<div class="flex items-center gap-2 shrink-0"><div class="relative group"><button class="h-9 px-4 bg-primary text-on-primary rounded hover:bg-primary-container transition-all flex items-center gap-2 text-label-md font-label-md shadow-sm" type="button"><span class="material-symbols-outlined" data-icon="file_download">file_download</span><span class="">Export</span><span class="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span></button><div class="absolute right-0 mt-1 w-44 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 hidden group-hover:block z-30"><a class="flex items-center gap-2 px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container" href="#"><span class="material-symbols-outlined text-outline" data-icon="table_view">table_view</span><span class="">Export as CSV</span></a><a class="flex items-center gap-2 px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container" href="#"><span class="material-symbols-outlined text-outline" data-icon="picture_as_pdf">picture_as_pdf</span><span class="">Export as PDF</span></a></div></div></div>
</div>
<!-- REPORT NAVIGATION (4 TABS SEGMENTED CONTROL) -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-1.5 shadow-sm">
<div class="grid grid-cols-1 md:grid-cols-4 gap-1.5">
<!-- 1. Sales Reports (ACTIVE) -->
<button class="flex flex-col items-start p-3 rounded bg-primary text-on-primary text-left transition-all shadow-sm" type="button">
<div class="flex items-center gap-2 w-full">
<span class="material-symbols-outlined text-on-primary" data-icon="point_of_sale" style="font-variation-settings: 'FILL' 1;">point_of_sale</span>
<span class="text-label-lg font-label-lg font-bold">Sales Reports</span>
<span class="ml-auto w-2 h-2 rounded-full bg-white"></span>
</div>
<span class="text-body-sm font-body-sm text-on-primary-container mt-1">Sales performance and transaction activity.</span>
</button>
<!-- 2. Inventory Reports -->
<button class="flex flex-col items-start p-3 rounded hover:bg-surface-container text-left transition-all text-on-surface" type="button">
<div class="flex items-center gap-2 w-full">
<span class="material-symbols-outlined text-outline" data-icon="inventory_2">inventory_2</span>
<span class="text-label-lg font-label-lg font-semibold">Inventory Reports</span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant mt-1">Stock levels, movement, valuation &amp; condition.</span>
</button>
<!-- 3. Profit Reports -->
<button class="flex flex-col items-start p-3 rounded hover:bg-surface-container text-left transition-all text-on-surface" type="button">
<div class="flex items-center gap-2 w-full">
<span class="material-symbols-outlined text-outline" data-icon="trending_up">trending_up</span>
<span class="text-label-lg font-label-lg font-semibold">Profit Reports</span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant mt-1">Gross profit &amp; margin from recorded costs.</span>
</button>
<!-- 4. Closing Reports -->
<button class="flex flex-col items-start p-3 rounded hover:bg-surface-container text-left transition-all text-on-surface" type="button">
<div class="flex items-center gap-2 w-full">
<span class="material-symbols-outlined text-outline" data-icon="lock_clock">lock_clock</span>
<span class="text-label-lg font-label-lg font-semibold">Closing Reports</span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant mt-1">Daily closing and payment reconciliation.</span>
</button>
</div>
</div>
<!-- GLOBAL REUSABLE REPORT FILTERS BAR -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center bg-surface-container-low border border-outline-variant rounded p-1"><span class="material-symbols-outlined text-outline ml-1 mr-1.5" data-icon="calendar_today">calendar_today</span><button class="px-2.5 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface rounded" type="button">Today</button><button class="px-2.5 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface rounded" type="button">Last 7 Days</button><button class="px-2.5 py-1 text-label-sm font-label-sm bg-primary text-on-primary rounded font-semibold shadow-xs" type="button">This Month</button><button class="px-2.5 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface rounded" type="button">Custom Range</button><span class="h-4 w-px bg-outline-variant mx-1"></span><span class="px-2 text-label-sm font-label-sm text-on-surface font-medium">Oct 1, 2026 – Oct 31, 2026</span></div><div class="flex items-center gap-2"><label class="text-label-sm font-label-sm text-on-surface-variant">Branch:</label><div class="relative"><select class="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"><option selected="">All Branches</option><option>Branch 1</option><option>Branch 2</option><option>Branch 3</option></select><span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none" data-icon="arrow_drop_down">arrow_drop_down</span></div></div><div class="flex items-center gap-2"><label class="text-label-sm font-label-sm text-on-surface-variant">Breakdown:</label><div class="relative"><select class="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"><option selected="">By Day</option><option>By Branch</option><option>By Employee</option><option>By Product</option><option>By Payment Method</option></select><span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none" data-icon="arrow_drop_down">arrow_drop_down</span></div></div></div><div class="flex items-center gap-2 shrink-0 self-end xl:self-auto"><button class="h-9 px-3 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface rounded text-label-md font-label-md transition-colors" type="button">Reset</button><button class="h-9 px-4 bg-primary text-on-primary rounded text-label-md font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5" type="button"><span class="material-symbols-outlined text-sm" data-icon="filter_alt">filter_alt</span><span class="">Apply Filters</span></button></div></div>
<!-- 1. KEY KPI SUMMARY CARDS (4 IN A GRID) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<!-- KPI 1: Total Sales -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm relative overflow-hidden">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md text-on-surface-variant font-medium">Total Sales</span>
<div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
<span class="material-symbols-outlined" data-icon="payments">payments</span>
</div>
</div>
<div class="mt-2 flex items-baseline gap-2">
<span class="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight">ETB 148,250.00</span>
</div>
<div class="mt-2 flex items-center gap-1.5">
<span class="inline-flex items-center text-label-sm font-label-sm font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
<span class="material-symbols-outlined text-xs mr-0.5" data-icon="trending_up">trending_up</span>
              +12.4%
            </span>
<span class="text-body-sm font-body-sm text-on-surface-variant">vs previous period</span>
</div>
<div class="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
</div>
<!-- KPI 2: Sales Transactions -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm relative overflow-hidden">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md text-on-surface-variant font-medium">Sales Transactions</span>
<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
<span class="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
</div>
</div>
<div class="mt-2 flex items-baseline gap-2">
<span class="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight">412</span>
<span class="text-body-sm font-body-sm text-on-surface-variant">completed sales</span>
</div>
<div class="mt-2 flex items-center gap-1.5">
<span class="inline-flex items-center text-label-sm font-label-sm font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
<span class="material-symbols-outlined text-xs mr-0.5" data-icon="trending_up">trending_up</span>
              +8.1%
            </span>
<span class="text-body-sm font-body-sm text-on-surface-variant">13.3 avg / day</span>
</div>
</div>
<!-- KPI 3: Average Sale -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm relative overflow-hidden">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md text-on-surface-variant font-medium">Average Sale</span>
<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
<span class="material-symbols-outlined" data-icon="analytics">analytics</span>
</div>
</div>
<div class="mt-2 flex items-baseline gap-2">
<span class="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight">ETB 359.83</span>
</div>
<div class="mt-2 flex items-center gap-1.5">
<span class="inline-flex items-center text-label-sm font-label-sm font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
<span class="material-symbols-outlined text-xs mr-0.5" data-icon="trending_up">trending_up</span>
              +3.9%
            </span>
<span class="text-body-sm font-body-sm text-on-surface-variant">per completed sale</span>
</div>
</div>
<!-- KPI 4: Top Product -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm relative overflow-hidden">
<div class="flex items-center justify-between">
<span class="text-label-md font-label-md text-on-surface-variant font-medium">Top Product</span>
<div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
<span class="material-symbols-outlined" data-icon="stars">stars</span>
</div>
</div>
<div class="mt-2">
<span class="text-label-lg font-label-lg font-bold text-on-surface line-clamp-1">Double A A4 Paper 80gsm</span>
</div>
<div class="mt-2 flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">184 reams sold</span>
<span class="text-label-md font-label-md font-semibold text-primary">ETB 82,800.00</span>
</div>
</div>
</div>
<!-- 2. VISUAL COMPARISON ROW (Two columns: 60% Left, 40% Right) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- LEFT COLUMN: SALES TREND LINE CHART (60% ~ 7 cols) -->
<div class="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col justify-between">
<div>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-outline-variant/60">
<div>
<h3 class="text-headline-sm font-headline-sm text-on-surface font-bold">Sales Trend</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Daily sales performance in Ethiopian Birr (ETB)</p>
</div>
<!-- Segmented Toggle: Day / Week / Month -->
<div class="flex items-center bg-surface-container-low border border-outline-variant rounded p-0.5">
<button class="px-2.5 py-1 text-label-sm font-label-sm bg-primary text-on-primary rounded font-semibold shadow-xs" type="button">Day</button>
<button class="px-2.5 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface" type="button">Week</button>
<button class="px-2.5 py-1 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface" type="button">Month</button>
</div>
</div>
<!-- Peak Callout Indicator -->
<div class="mt-4 flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface-variant">Oct 1 – Oct 31, 2026</span>
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-label-sm font-label-sm font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Peak Day: Oct 18 (ETB 14,210.00)
              </span>
</div>
</div>
<!-- SVG Smooth Line & Area Chart -->
<div class="mt-4 w-full h-64 relative">
<svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 240">
<defs>
<linearGradient id="salesGrad" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stop-color="#0047FF" stop-opacity="0.28"></stop>
<stop offset="100%" stop-color="#0047FF" stop-opacity="0.0"></stop>
</linearGradient>
</defs>
<!-- Grid Horizontal Lines & Y-Axis Labels -->
<g stroke="#E2E7EE" stroke-dasharray="3 3" stroke-width="1">
<line x1="45" x2="590" y1="20" y2="20"></line>
<line x1="45" x2="590" y1="70" y2="70"></line>
<line x1="45" x2="590" y1="120" y2="120"></line>
<line x1="45" x2="590" y1="170" y2="170"></line>
<line x1="45" x2="590" y1="210" y2="210"></line>
</g>
<!-- Y-Axis Labels -->
<g fill="#747688" font-family="Plus Jakarta Sans" font-size="10">
<text x="5" y="24">15,000</text>
<text x="5" y="74">10,000</text>
<text x="12" y="124">7,500</text>
<text x="12" y="174">5,000</text>
<text x="25" y="214">0</text>
</g>
<!-- Gradient Area under curve -->
<path d="M 50 185
                       C 80 170, 110 160, 130 145
                       C 150 130, 180 155, 200 135
                       C 230 105, 260 120, 280 85
                       C 300 50, 320 30, 340 28
                       C 365 26, 380 90, 410 70
                       C 440 50, 470 115, 500 95
                       C 530 75, 560 65, 585 55
                       L 585 210 L 50 210 Z" fill="url(#salesGrad)"></path>
<!-- Smooth Trend Line -->
<path d="M 50 185
                       C 80 170, 110 160, 130 145
                       C 150 130, 180 155, 200 135
                       C 230 105, 260 120, 280 85
                       C 300 50, 320 30, 340 28
                       C 365 26, 380 90, 410 70
                       C 440 50, 470 115, 500 95
                       C 530 75, 560 65, 585 55" fill="none" stroke="#0047FF" stroke-linecap="round" stroke-width="3"></path>
<!-- Key Data Points -->
<circle cx="50" cy="185" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<circle cx="130" cy="145" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<circle cx="200" cy="135" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<circle cx="280" cy="85" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<!-- Peak Highlight Node -->
<circle cx="340" cy="28" fill="#0047FF" r="6" stroke="#FFFFFF" stroke-width="2.5"></circle>
<!-- Peak Pin Badge -->
<rect fill="#161C27" height="18" rx="3" width="70" x="305" y="4"></rect>
<text fill="#FFFFFF" font-family="Plus Jakarta Sans" font-size="9" font-weight="600" x="312" y="16">ETB 14,210</text>
<circle cx="410" cy="70" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<circle cx="500" cy="95" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
<circle cx="585" cy="55" fill="#FFFFFF" r="4" stroke="#0047FF" stroke-width="2"></circle>
</svg>
<!-- X-Axis Labels -->
<div class="flex justify-between pl-10 pr-2 pt-1 text-label-sm font-label-sm text-outline border-t border-outline-variant/60">
<span class="">Oct 1</span>
<span class="">Oct 5</span>
<span class="">Oct 10</span>
<span class="">Oct 15</span>
<span class="text-primary font-bold">Oct 18 (Peak)</span>
<span class="">Oct 22</span>
<span class="">Oct 27</span>
<span class="">Oct 31</span>
</div>
</div>
</div>
<!-- RIGHT COLUMN: SALES BY BRANCH & PAYMENT METHOD (40% ~ 5 cols) -->
<div class="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col justify-between"><div><div class="flex items-center justify-between pb-3 border-b border-outline-variant/60"><div><h3 class="text-headline-sm font-headline-sm text-on-surface font-bold">Sales by Branch</h3><p class="text-body-sm font-body-sm text-on-surface-variant">Comparison across all three branches</p></div><span class="text-label-sm font-label-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface">3 Branches</span></div><div class="mt-4 space-y-3.5"><div><div class="flex items-center justify-between text-body-sm font-body-sm mb-1"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-primary"></span><span class="font-semibold text-on-surface">Branch 1</span></div><div class="text-right"><span class="font-bold text-on-surface">ETB 68,400.00</span><span class="text-label-sm text-outline ml-1">(46.1%)</span></div></div><div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden"><div class="bg-primary h-2 rounded-full" style="width: 46.1%"></div></div></div><div><div class="flex items-center justify-between text-body-sm font-body-sm mb-1"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-primary-fixed-dim"></span><span class="font-semibold text-on-surface">Branch 2</span></div><div class="text-right"><span class="font-bold text-on-surface">ETB 52,150.00</span><span class="text-label-sm text-outline ml-1">(35.2%)</span></div></div><div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden"><div class="bg-primary-fixed-dim h-2 rounded-full" style="width: 35.2%"></div></div></div><div><div class="flex items-center justify-between text-body-sm font-body-sm mb-1"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-secondary"></span><span class="font-semibold text-on-surface">Branch 3</span></div><div class="text-right"><span class="font-bold text-on-surface">ETB 27,700.00</span><span class="text-label-sm text-outline ml-1">(18.7%)</span></div></div><div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden"><div class="bg-secondary h-2 rounded-full" style="width: 18.7%"></div></div></div></div></div><div class="mt-6 pt-4 border-t border-outline-variant/60"><div class="flex items-center justify-between mb-2"><span class="text-label-md font-label-md font-bold text-on-surface">Payment Method Breakdown</span><span class="text-label-sm font-label-sm text-outline">Configured Payment Methods</span></div><div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex my-2"><div class="bg-primary h-full" style="width: 55.6%" title="Cash: 55.6%"></div><div class="bg-primary-fixed-dim h-full" style="width: 27.8%" title="Bank Transfer: 27.8%"></div><div class="bg-secondary-fixed-dim h-full" style="width: 16.6%" title="Mobile Payment: 16.6%"></div></div><div class="grid grid-cols-3 gap-2 text-label-sm font-label-sm mt-2"><div class="flex flex-col"><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary"></span><span class="text-on-surface-variant">Cash</span></div><span class="font-bold text-on-surface mt-0.5">ETB 82,500.00</span><span class="text-outline text-xs">55.6%</span></div><div class="flex flex-col"><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary-fixed-dim"></span><span class="text-on-surface-variant">Bank Transfer</span></div><span class="font-bold text-on-surface mt-0.5">ETB 41,250.00</span><span class="text-outline text-xs">27.8%</span></div><div class="flex flex-col"><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span><span class="text-on-surface-variant">Mobile Pay</span></div><span class="font-bold text-on-surface mt-0.5">ETB 24,500.00</span><span class="text-outline text-xs">16.6%</span></div></div></div></div>
</div>
<!-- 3. DETAILED SALES REPORT TABLE CARD -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
<!-- Table Header Toolbar -->
<div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant">
<div>
<div class="flex items-center gap-2">
<h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">Detailed Sales Summary</h3>
<span class="text-label-sm font-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">Daily Aggregation</span>
</div>
<p class="text-body-sm font-body-sm text-on-surface-variant">Review sales totals and transaction activity for the selected period.</p>
</div>
<div class="flex items-center gap-3">
<span class="text-label-sm font-label-sm text-outline hidden sm:inline">Showing 10 of 31 days</span>
<button class="h-8 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded text-label-sm font-label-sm flex items-center gap-1.5 transition-colors" type="button">
<span class="material-symbols-outlined text-outline" data-icon="file_download">file_download</span>
<span class="">Export Table (CSV)</span>
</button>
</div>
</div>
<!-- Tabular Data -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
<th class="py-3 px-4 font-semibold">Date</th>
<th class="py-3 px-4 font-semibold">Branch</th>
<th class="py-3 px-4 font-semibold text-right">Transactions</th>
<th class="py-3 px-4 font-semibold text-right">Average Sale</th>
<th class="py-3 px-4 font-semibold">Top Selling Item</th>
<th class="py-3 px-4 font-semibold text-right">Total Sales</th>
<th class="py-3 px-4 font-semibold text-center">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/60 text-body-sm font-body-sm text-on-surface">
<!-- Row 1 (Oct 18 Peak) -->
<tr class="hover:bg-surface-container-low/70 transition-colors bg-[#FFF8E7]/40 border-l-4 border-l-primary">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-sm" data-icon="event">event</span>
                  Oct 18, 2026
                  <span class="text-label-sm px-1.5 py-0.2 bg-primary text-on-primary rounded text-[10px] uppercase font-bold">Peak</span>
</td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">42</td>
<td class="py-3 px-4 text-right">ETB 338.33</td>
<td class="py-3 px-4 text-on-surface-variant font-medium">Double A A4 Paper 80gsm (28 reams)</td>
<td class="py-3 px-4 text-right font-bold text-primary">ETB 14,210.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-sm" data-icon="event">event</span>
                  Oct 17, 2026
                </td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">35</td>
<td class="py-3 px-4 text-right">ETB 265.42</td>
<td class="py-3 px-4 text-on-surface-variant">Bic Cristal Medium Pen - Blue (120 pcs)</td>
<td class="py-3 px-4 text-right font-bold text-on-surface">ETB 9,290.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-sm" data-icon="event">event</span>
                  Oct 16, 2026
                </td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">29</td>
<td class="py-3 px-4 text-right">ETB 281.03</td>
<td class="py-3 px-4 text-on-surface-variant">Pelikan Highlighter 4-Pack Set (14 sets)</td>
<td class="py-3 px-4 text-right font-bold text-on-surface">ETB 8,150.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-sm" data-icon="event">event</span>
                  Oct 15, 2026
                </td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">38</td>
<td class="py-3 px-4 text-right">ETB 310.00</td>
<td class="py-3 px-4 text-on-surface-variant">Kangaro Stapler Heavy Duty 24/6 (8 units)</td>
<td class="py-3 px-4 text-right font-bold text-on-surface">ETB 11,780.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
<!-- Row 5 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-sm" data-icon="event">event</span>
                  Oct 14, 2026
                </td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">24</td>
<td class="py-3 px-4 text-right">ETB 267.50</td>
<td class="py-3 px-4 text-on-surface-variant">Oxford Spiral Notebook 200 Pages (32 pcs)</td>
<td class="py-3 px-4 text-right font-bold text-on-surface">ETB 6,420.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
<!-- Row 6 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3 px-4 font-medium flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-sm" data-icon="event">event</span>
                  Oct 13, 2026
                </td>
<td class="py-3 px-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface">
                    All Branches
                  </span>
</td>
<td class="py-3 px-4 text-right font-medium">31</td>
<td class="py-3 px-4 text-right">ETB 254.19</td>
<td class="py-3 px-4 text-on-surface-variant">Casio Scientific Calculator FX-991ES (4 pcs)</td>
<td class="py-3 px-4 text-right font-bold text-on-surface">ETB 7,880.00</td>
<td class="py-3 px-4 text-center">
<button class="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5" type="button">
                    View Details
                    <span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Footer / Pagination -->
<div class="p-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-label-md font-label-md">
<span class="text-on-surface-variant">Page 1 of 4 (31 days total)</span>
<div class="flex items-center gap-1">
<button class="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center disabled:opacity-40" disabled="" type="button">
<span class="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
</button>
<button class="w-8 h-8 rounded bg-primary text-on-primary font-bold flex items-center justify-center" type="button">1</button>
<button class="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center" type="button">2</button>
<button class="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center" type="button">3</button>
<button class="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center" type="button">4</button>
<button class="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center" type="button">
<span class="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- 4. QUICK SWITCH PREVIEWS / SUMMARY BANNERS FOR OTHER MODULES AT BOTTOM -->

<!-- FOOTER AUDIT NOTICE -->
<div class="py-3 px-4 bg-surface-container-low border border-outline-variant rounded text-center text-body-sm font-body-sm text-on-surface-variant"><span class="">Reports are read-only views for business performance. Sample demonstration data is for illustrative purposes only. All financial figures are denominated in Ethiopian Birr (ETB).</span></div>
</main>
</div>


</body></html>