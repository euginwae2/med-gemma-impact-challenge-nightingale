import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PreVisitState {
  currentStep: number;
  symptoms: string[];
  severity: number;
  notes: string;
  isSubmitted: boolean;
}

const initialState: PreVisitState = {
  currentStep: 0,
  symptoms: [],
  severity: 5,
  notes: "",
  isSubmitted: false,
};

export const preVisitSlice = createSlice({
  name: "preVisit",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateSymptoms: (state, action: PayloadAction<string[]>) => {
      state.symptoms = action.payload;
    },
    updateSeverity: (state, action: PayloadAction<number>) => {
      state.severity = action.payload;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    resetCheckIn: () => initialState,
  },
});

export const {
  setStep,
  updateSymptoms,
  updateSeverity,
  setNotes,
  resetCheckIn,
} = preVisitSlice.actions;
export default preVisitSlice.reducer;
