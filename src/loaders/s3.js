require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

exports.uploadFileToS3 = (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadInfo = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadInfo).promise();
};

exports.getFileFromS3 = (fileKey) => {
  const downloadInfo = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadInfo).createReadStream();
};
