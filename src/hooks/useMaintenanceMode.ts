import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .single();

        if (error) throw error;

        const settings = data?.value as unknown as MaintenanceSettings;
        setIsMaintenanceMode(settings?.enabled || false);
        setMaintenanceMessage(settings?.message || "Website sedang dalam perbaikan.");
      } catch (error) {
        console.error("Error fetching maintenance mode:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceMode();

    // Subscribe to changes
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "site_settings",
          filter: "key=eq.maintenance_mode",
        },
        (payload) => {
          const settings = payload.new.value as MaintenanceSettings;
          setIsMaintenanceMode(settings?.enabled || false);
          setMaintenanceMessage(settings?.message || "Website sedang dalam perbaikan.");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isMaintenanceMode, maintenanceMessage, loading };
}
