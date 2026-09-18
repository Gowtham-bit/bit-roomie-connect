import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetHostels,
  apiGetHostelById,
  apiGetRoommateMatches,
  apiSendRoommateRequest,
  apiGetComplaints,
  apiCreateComplaint,
  apiGetPayments,
  apiGetAttendance,
  apiGetNotifications,
  apiGetStats,
  apiGetMe,
  getCurrentUser,
} from "../lib/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const me = await apiGetMe();
      if (me && !me.error) return me;
      return getCurrentUser();
    },
  });
}

export function useHostels(type = "All", search = "") {
  return useQuery({
    queryKey: ["hostels", type, search],
    queryFn: () => apiGetHostels(type, search),
    staleTime: 1000 * 60 * 5,
  });
}

export function useHostelDetails(id) {
  return useQuery({
    queryKey: ["hostel", id],
    queryFn: () => apiGetHostelById(id),
    enabled: !!id,
  });
}

export function useRoommateMatches(params = {}) {
  return useQuery({
    queryKey: ["roommates", params],
    queryFn: () => apiGetRoommateMatches(params),
  });
}

export function useComplaints(params = {}) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: () => apiGetComplaints(params),
  });
}

export function usePayments(params = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => apiGetPayments(params),
  });
}

export function useAttendance(params = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => apiGetAttendance(params),
  });
}

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => apiGetNotifications(params),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: apiGetStats,
  });
}

export function useSendRoommateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiSendRoommateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiCreateComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}
