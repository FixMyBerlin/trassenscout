import { clsx } from "clsx"
import Document, { Head, Html, Main, NextScript } from "next/document"

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }

  render() {
    return (
      <Html lang="de" className={clsx("h-full scroll-smooth")}>
        <Head />
        <body className="flex min-h-full w-full text-gray-900 antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
