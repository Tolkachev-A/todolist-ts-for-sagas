import {setAppStatusAC} from "../../app/app-reducer";
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {setIsLoggedInAC} from "./auth-reducer";
import {call, put, takeEvery} from "redux-saga/effects";
import {INIT_APP} from "../../app/app-sagas";

export function* loginWorker( action: ReturnType<typeof loginWC> ) {
  try {
    yield put(setAppStatusAC("loading"))
    const res = yield call(authAPI.login, action.data)
    if (res.data.resultCode === 0) {
      yield put(setIsLoggedInAC(true))
      yield put(setAppStatusAC("succeeded"))
    } else {
      yield handleServerAppError(res.data)
    }
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}

export function* logoutWorker() {
  debugger
  try {
    yield put(setAppStatusAC("loading"))
    const res = yield call(authAPI.logout)
    if (res.data.resultCode === 0) {
      yield put(setIsLoggedInAC(true))
      yield put(setAppStatusAC("succeeded"))
      yield put(INIT_APP)
    } else {
      yield handleServerAppError(res.data)
    }
  } catch (e) {
    yield handleServerNetworkError(e)
  }
}


export const loginWC = ( data: LoginParamsType ) => ({ type: "LOGIN-WATCHER", data })
export const logoutWC = { type: "LOGOUT-WATCHER" }


export function* loginWatcher() {
  yield takeEvery("LOGIN-WATCHER", loginWorker)
  yield takeEvery("LOGOUT-WATCHER", logoutWorker)
}
