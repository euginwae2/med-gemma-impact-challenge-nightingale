import { Controller, useFormContext } from "react-hook-form";
import { Slider, Box, Typography } from "@mui/material";

export const SymptomSeveritySlider = ({
  name,
  label,
}: {
  name: string;
  label: string;
}) => {
  const { control } = useFormContext();

  const descriptionId = `${name}-description`;
  const labelId = `${name}-label`;

  return (
    <Box className="py-md">
      <Typography id={labelId} gutterBottom className="font-sans font-bold">
        {label}
      </Typography>

      <Controller
        name={name}
        control={control}
        defaultValue={0}
        render={({ field }) => (
          <Slider
            {...field}
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            sx={{
              color: "primary.main",
              "& .MuiSlider-thumb": { borderRadius: "4px" },
            }}
          />
        )}
      />

      <div
        id={descriptionId}
        className="flex justify-between text-caption text-text/50"
      >
        <span>None</span>
        <span>Severe</span>
      </div>
    </Box>
  );
};
