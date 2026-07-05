import type { ReactNode } from "react";

export interface QhdsHeaderNavItem {
  href: string;
  icon?: ReactNode;
  id?: string;
  items?: QhdsHeaderNavItem[];
  label: ReactNode;
}

export interface QhdsHeaderCtaItem {
  href: string;
  icon?: ReactNode;
  label: string;
}

export interface QhdsHeaderProps {
  accountHref?: string;
  accountName?: string | null;
  actions?: ReactNode;
  baseUrlHref?: string;
  baseUrlText?: string;
  brandHref?: string;
  ctaItems?: QhdsHeaderCtaItem[];
  logoutHref?: string;
  logoutLabel?: string;
  mobileMainNavActiveHref?: string;
  mobileMainNavAriaLabel?: string;
  mobileMainNavHeading?: string;
  mobileMainNavId?: string;
  mobileMainNavItems?: QhdsHeaderNavItem[];
  navItems?: QhdsHeaderNavItem[];
  onNavigate?: (href: string) => void;
  serviceDescription?: string;
  serviceName?: string;
  showAccountControls?: boolean;
  showMobileMainNav?: boolean;
  width?: "app" | "contained";
}
