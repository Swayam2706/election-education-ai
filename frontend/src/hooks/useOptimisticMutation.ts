import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  queryKey?: string[];
  optimisticUpdate?: (variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  queryKey,
  optimisticUpdate,
  successMessage,
  errorMessage,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (queryKey && optimisticUpdate) {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update
        queryClient.setQueryData(queryKey, optimisticUpdate(variables));

        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      if (errorMessage) {
        toast.error(errorMessage);
      }
      
      onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after mutation
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}