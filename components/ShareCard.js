import { QRCodeCanvas } from 'qrcode.react'

const downloadQRCode = () => {
  const canvas = document.getElementById("qr-gen");
  const pngUrl = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  let downloadLink = document.createElement("a");
  downloadLink.href = pngUrl;
  downloadLink.download = `drop.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};


export default function ShareCard(props) {
  const url = props.url
  const logo = props.logo || "/favicon.ico"

  return (
    <>
      <label className="text-2xl font-bold font-flow">Share DROP</label>

      <div className="flex min-w-[200px] min-h-[200px] justify-center
      ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden
      shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-center">
        <button 
          onClick={downloadQRCode}
          >
          <QRCodeCanvas
            id="qr-gen"
            value={url}
            size={160}
            bgColor={"#ffffff"}
            fgColor={"#58d27d"}
            level={"H"}
            includeMargin={false}
            imageSettings={{
              src: logo,
              height: 24,
              width: 24,
              excavate: true
            }}
          />
        </button>
      </div>
    </>
  )
}