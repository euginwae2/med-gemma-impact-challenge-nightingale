"use client";
import { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Paper,
  Typography,
} from "@mui/material";

const steps = ["Symptoms", "Severity", "Review"];

export default function CheckInPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Typography variant="h4" align="center" mb={4}>
        Daily Check-In
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper
        elevation={2}
        sx={{ p: 4, minHeight: 300, display: "flex", flexDirection: "column" }}
      >
        <Box flexGrow={1}>
          <Typography variant="h6">
            Step {activeStep + 1}: {steps[activeStep]}
          </Typography>
          <Typography color="text.secondary" mt={2}>
            Form content goes here...
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
            }
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
