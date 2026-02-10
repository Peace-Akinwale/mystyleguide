'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  BookOpen,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-lg transition-all active:scale-95',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
