"use client";

import { Bell, CircleUserRound, Search } from "lucide-react";

type AppHeaderProps = {
  title?: string;
  onSearch: () => void;
  onNotifications?: () => void;
  onProfile: () => void;
};

export function AppHeader({ title = "Aura of Intelligence", onSearch, onNotifications, onProfile }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-lockup" aria-label="Aura of Intelligence">
        <span className="brand-orbit" aria-hidden="true"><i /></span>
        <span>
          <strong>{title}</strong>
          <small>A Bridge to The Infinite</small>
        </span>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" onClick={onSearch} aria-label="Search Aura">
          <Search size={19} aria-hidden="true" />
        </button>
        {onNotifications ? <button className="icon-button notification-button" type="button" onClick={onNotifications} aria-label="Notifications"><Bell size={19} aria-hidden="true" /><span aria-hidden="true" /></button> : null}
        <button className="profile-button" type="button" onClick={onProfile} aria-label="Open your Aura profile">
          <CircleUserRound size={24} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
