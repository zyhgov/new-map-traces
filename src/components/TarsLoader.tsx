import './TarsLoader.css'

interface TarsLoaderProps {
  text?: string
}

export default function TarsLoader({ text = '正在加载...' }: TarsLoaderProps) {
  return (
    <div className="tars-loader-wrapper">
      <div className="loader">
        <div className="tars">
          <div className="container c1">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container c2">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container c3">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container c4">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
        </div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}