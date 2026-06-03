import { 
  Crown, Sword, Shield, Target, Flame, Gem, Ghost, Zap, 
  Trophy, HelpCircle, Settings, GraduationCap, User, Bot, 
  Home, Star, Swords, ChevronLeft, Volume2, Music, Clock, Sparkles
} from 'lucide-react';

export const Icons = {
  Crown,
  Sword,
  Shield,
  Target,
  Flame,
  Gem,
  Ghost,
  Zap,
  Trophy,
  HelpCircle,
  Settings,
  GraduationCap,
  User,
  Bot,
  Home,
  Star,
  Swords,
  ChevronLeft,
  Volume2,
  Music,
  Clock,
  Sparkles,
};

export type IconName = keyof typeof Icons;

export function renderIcon(name: string, props: any = {}) {
  const Icon = Icons[name as IconName] || HelpCircle;
  return <Icon {...props} />;
}
