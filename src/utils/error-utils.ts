import {setAppErrorAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from "../app/app-reducer"
import {ResponseType} from "../api/todolists-api"
import {Dispatch} from "redux"
import {put} from "redux-saga/effects";

export function* handleServerAppError<D>( data: ResponseType<D> ) {
  if (data.messages.length) {
    yield put(setAppErrorAC(data.messages[ 0 ]))
  } else {
    yield put(setAppErrorAC("Some error occurred"))
  }
  yield put(setAppStatusAC("failed"))
}

export function* handleServerNetworkError( error: { message: string } ) {
  yield put(setAppErrorAC(error.message ? error.message : "Some error occurred"))
  yield put(setAppStatusAC("failed"))
}
