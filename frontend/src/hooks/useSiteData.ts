import { useQuery } from '@tanstack/react-query';
import { siteService } from '@/services/site.service';
import { useUIStore } from '@/store/useUIStore';

export function useStatCards() {
  const { language } = useUIStore();
  
  return useQuery({
    queryKey: ['site', 'stats', language],
    queryFn: () => siteService.getStatCards(language),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data.stats,
  });
}

export function useFeatureCards() {
  const { language } = useUIStore();
  
  return useQuery({
    queryKey: ['site', 'features', language],
    queryFn: () => siteService.getFeatureCards(language),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data.features,
  });
}

export function useChatSuggestions(category?: string) {
  const { language } = useUIStore();
  
  return useQuery({
    queryKey: ['site', 'chat-suggestions', language, category],
    queryFn: () => siteService.getChatSuggestions(language, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: any) => data.suggestions,
  });
}

export function useNavigationLinks() {
  const { language } = useUIStore();
  
  return useQuery({
    queryKey: ['site', 'navigation', language],
    queryFn: () => siteService.getNavigationLinks(language),
    staleTime: 15 * 60 * 1000, // 15 minutes
    select: (data: any) => data.links,
  });
}

export function useFooterSections() {
  const { language } = useUIStore();
  
  return useQuery({
    queryKey: ['site', 'footer', language],
    queryFn: () => siteService.getFooterSections(language),
    staleTime: 15 * 60 * 1000, // 15 minutes
    select: (data: any) => data.sections,
  });
}