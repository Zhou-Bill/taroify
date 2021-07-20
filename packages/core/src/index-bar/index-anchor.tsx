import { View } from "@tarojs/components"
import { pageScrollTo } from "@tarojs/taro"
import classNames from "classnames"
import * as React from "react"
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
} from "react"
import { prefixClassname } from "../styles"
import { HAIRLINE_BORDER_BOTTOM } from "../styles/hairline"
import { TaroElement } from "../utils/dom/element"
import { addUnitPx } from "../utils/format/unit"
import { getBoundingClientRect } from "../utils/rect"
import IndexBarContext from "./index-bar.context"

export interface IndexAnchorInstance {
  scrollIntoView(scrollTop: number): void
}

export interface IndexAnchorProps {
  index: number | string
  children?: ReactNode
}

interface InternalIndexAnchorProps extends IndexAnchorProps {
  arrayedIndex?: number
}

const IndexAnchor = forwardRef(
  (props: IndexAnchorProps, ref: ForwardedRef<IndexAnchorInstance>) => {
    const { arrayedIndex, index, children } = props as InternalIndexAnchorProps

    const {
      activeArrayedIndex,
      sticky: stickyProp,
      stickyOffsetTop,
      zIndex,
      highlightColor,
      getAnchorRects,
      getListRect,
    } = useContext(IndexBarContext)

    const rootRef = useRef<TaroElement>()

    const scrollIntoView = useCallback(
      (scrollTop: number) =>
        getBoundingClientRect(rootRef).then(({ top }) =>
          pageScrollTo({
            duration: 0,
            scrollTop: Math.ceil(scrollTop + top),
          }),
        ),
      [],
    )

    useImperativeHandle(ref as ForwardedRef<IndexAnchorInstance>, () => ({
      scrollIntoView,
    }))

    let wrapperStyle: string = ""

    let anchorStyle = ""

    let active: boolean = false

    if (stickyProp) {
      if (arrayedIndex === activeArrayedIndex) {
        const { top, height } = getAnchorRects()[arrayedIndex]

        const activeAnchorSticky = top <= 0
        anchorStyle = `
              color: ${highlightColor};
            `

        if (activeAnchorSticky) {
          wrapperStyle = `
                height: ${addUnitPx(height)};
              `
          anchorStyle = `
                position: fixed;
                top: ${addUnitPx(stickyOffsetTop)};
                z-index: ${zIndex};
                color: ${highlightColor};
              `
        }

        active = true
      } else if (arrayedIndex === activeArrayedIndex - 1) {
        const listRect = getListRect()
        const anchorRects = getAnchorRects()
        const currentAnchor = anchorRects[arrayedIndex]
        const currentOffsetTop = currentAnchor.top
        const targetOffsetTop =
          arrayedIndex === anchorRects.length - 1 ? listRect.top : anchorRects[arrayedIndex + 1].top
        const parentOffsetHeight = targetOffsetTop - currentOffsetTop
        const translateY = parentOffsetHeight - currentAnchor.height
        anchorStyle = `
              position: relative;
              transform: translate3d(0, ${addUnitPx(translateY)}, 0);
              z-index: ${zIndex};
              color: ${highlightColor};
            `

        active = true
      } else {
        wrapperStyle = ""
        anchorStyle = ""
        active = false
      }
    }

    return (
      <View ref={rootRef} className={prefixClassname("index-anchor-wrapper")} style={wrapperStyle}>
        <View
          className={classNames(prefixClassname("index-anchor"), {
            [prefixClassname("index-anchor--sticky")]: active,
            [HAIRLINE_BORDER_BOTTOM]: active,
          })}
          style={anchorStyle}
          children={children ?? index}
        />
      </View>
    )
  },
)

export default IndexAnchor
