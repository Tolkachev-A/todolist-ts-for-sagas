import {authAPI, ResponseType} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";
import {call, put, takeEvery} from "redux-saga/effects"
import {AxiosResponse} from "axios";


export function* initializeAppWorker() {
  try {
    const res: AxiosResponse<ResponseType> = yield call(authAPI.me)
    if (res.data.resultCode === 0) {
      yield put(setIsLoggedInAC(true));
    } else {
      yield put(setIsLoggedInAC(false));
    }
  } finally {
    yield put(setAppInitializedAC(true))
  }
}

export const INIT_APP = { type: "INIT-APP" }

export function* initializeAppWatcher() {
  yield takeEvery("INIT-APP", initializeAppWorker)
}
