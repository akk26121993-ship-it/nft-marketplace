import axios from "axios";

const PINATA_API_KEY = "484c61d9be6c87ff2be2";
const PINATA_SECRET_KEY = "6d87e71def232167b0fa1dc49a78ad62624a1fc12d38a2f678e5f397806cd0f4";

// 🖼 Upload Image
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}

// 📦 Upload Metadata
export async function uploadMetadata(name, description, imageUrl) {
  const data = JSON.stringify({
    name,
    description,
    image: imageUrl,
  });

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    data,
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}