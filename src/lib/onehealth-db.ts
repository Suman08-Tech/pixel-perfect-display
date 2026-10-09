// Read-only queries against the connected Supabase project (public tables, anon SELECT policies).
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const dbDistrictsQuery = () =>
  queryOptions({
    queryKey: ["db", "districts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("districts").select("id,name,state,latitude,longitude").order("name");
      if (error) throw error;
      return data;
    },
  });

export const dbObservationsQuery = (districtId?: string) =>
  queryOptions({
    queryKey: ["db", "observations", districtId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("environmental_observations").select("*").order("observed_at", { ascending: false }).limit(50);
      if (districtId) q = q.eq("district_id", districtId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const dbAssessmentsQuery = (districtId?: string) =>
  queryOptions({
    queryKey: ["db", "assessments", districtId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("risk_assessments").select("*").order("calculated_at", { ascending: false }).limit(50);
      if (districtId) q = q.eq("district_id", districtId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
