import * as React from "react"
import { ReactNode } from "react"

enum TargetType {
  H5 = "h5",
}

type TargetTypeString = "h5"

interface TargetProps {
  type?: TargetType | TargetTypeString
  children?: ReactNode
}

export default function Target(props: TargetProps) {
  const { type, children } = props
  return (
    <>
      {type === process.env.TARO_ENV && children}
    </>
  )
}
