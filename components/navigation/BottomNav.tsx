'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  BookOpen,
  PenTool,
  User,
  MessageSquare,
} from 'lucide-react';

const navItems = [
  {
    name: 'Clips',
    href: '/clips',
    icon: FileText,
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: MessageSquare,
  },
  {
    name: 'Analyze',
    href: '/analyze',
    icon: Sparkles,
  },
  {
    name: 'Guide',
    href: '/guide',
    icon: BookOpen,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
