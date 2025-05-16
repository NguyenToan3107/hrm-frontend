import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Button } from "../ui/button";

interface Props {
  title: string;
  description: string;
}
export const StyledToastButton = (props: Props) => {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: props.title,
          description: props.description,
        });
      }}
    >
      Show Toast
    </Button>
  );
};
