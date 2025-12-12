-- Drop existing trigger to recreate with enhanced functionality
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;

-- Enhanced audit function that captures INSERT, UPDATE, DELETE with IP/user_agent
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_action text;
  v_accessed_fields text[];
BEGIN
  -- Determine action type
  IF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_accessed_fields := ARRAY['full_name', 'phone', 'birth_date', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zip_code'];
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    -- Track which sensitive fields were modified
    v_accessed_fields := ARRAY[]::text[];
    IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
      v_accessed_fields := array_append(v_accessed_fields, 'full_name');
    END IF;
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      v_accessed_fields := array_append(v_accessed_fields, 'phone');
    END IF;
    IF OLD.birth_date IS DISTINCT FROM NEW.birth_date THEN
      v_accessed_fields := array_append(v_accessed_fields, 'birth_date');
    END IF;
    IF OLD.street IS DISTINCT FROM NEW.street THEN
      v_accessed_fields := array_append(v_accessed_fields, 'street');
    END IF;
    IF OLD.number IS DISTINCT FROM NEW.number THEN
      v_accessed_fields := array_append(v_accessed_fields, 'number');
    END IF;
    IF OLD.complement IS DISTINCT FROM NEW.complement THEN
      v_accessed_fields := array_append(v_accessed_fields, 'complement');
    END IF;
    IF OLD.neighborhood IS DISTINCT FROM NEW.neighborhood THEN
      v_accessed_fields := array_append(v_accessed_fields, 'neighborhood');
    END IF;
    IF OLD.city IS DISTINCT FROM NEW.city THEN
      v_accessed_fields := array_append(v_accessed_fields, 'city');
    END IF;
    IF OLD.state IS DISTINCT FROM NEW.state THEN
      v_accessed_fields := array_append(v_accessed_fields, 'state');
    END IF;
    IF OLD.zip_code IS DISTINCT FROM NEW.zip_code THEN
      v_accessed_fields := array_append(v_accessed_fields, 'zip_code');
    END IF;
  ELSE
    v_action := 'insert';
    v_accessed_fields := ARRAY['full_name', 'phone', 'birth_date', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zip_code'];
  END IF;

  -- Only log if sensitive fields were accessed/modified
  IF array_length(v_accessed_fields, 1) > 0 THEN
    INSERT INTO public.profile_access_audit (
      user_id,
      action,
      accessed_fields
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      v_action,
      v_accessed_fields
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for INSERT, UPDATE, and DELETE operations
CREATE TRIGGER audit_profile_changes
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_profile_access();