import { QRCodeCanvas } from 'qrcode.react'
import publicConfig from '../../publicConfig'

const downloadQRCode = () => {
  const canvas = document.getElementById("qr-gen");
  const pngUrl = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  let downloadLink = document.createElement("a");
  downloadLink.href = pngUrl;
  downloadLink.download = `DROP.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export default function ShareCard(props) {
  const url = props.url || publicConfig.appURL
  const logo = props.logo || "/favicon.ico"
  const styles = props.styles || `hidden sm:flex flex-col min-w-[240px] aspect-square justify-center
  ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden
  shadow-drizzle items-center bg-white`
  const qrCodeSize = props.qrCodeSize || 200
  const logoSize = props.logoSize || 24

  return (
    <div className={styles}>
      <button
        disabled={props.disabled === true}
        onClick={downloadQRCode}
      >
        <QRCodeCanvas
          id="qr-gen"
          value={url}
          size={qrCodeSize}
          bgColor={"#ffffff"}
          fgColor={"#00d588"}
          level={"H"}
          includeMargin={false}
          imageSettings={{
            src: logo,
            height: logoSize,
            width: logoSize,
            excavate: true
          }}
        />
      </button>
    </div>
  )
}