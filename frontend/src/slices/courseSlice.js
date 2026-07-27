import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  step: 1,

  course: {
    courseName: "",
    courseDescription: "",
    courseContent: [],
    status: "Draft",
  },

  instructorCourses: [],
  loading: false,

  editCourse: false,
  paymentLoading: false,
}

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload
    },
    setCourse: (state, action) => {
      state.course = action.payload
    },
    setEditCourse: (state, action) => {
      state.editCourse = action.payload
    },
    resetCourseState: () => initialState,
  },
})

export const {
  setStep,
  setCourse,
  setEditCourse,
  resetCourseState,
} = courseSlice.actions

export default courseSlice.reducer
