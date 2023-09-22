const standard_name = (admin_address) => {
  let trimAddress = admin_address.trim();
  let splitAddress = trimAddress.split(" ");

  let cityName = splitAddress[0];
  let newCityName = cityName;
  let shortCityName = "";
  switch (cityName) {
    case "서울":
    case "서울특별시":
      shortCityName = "서울";
      newCityName = "서울특별시";
      break;
    case "인천":
    case "인천광역시":
      shortCityName = "인천";
      newCityName = "인천광역시";
      break;
    case "광주":
    case "광주광역시":
      shortCityName = "광주";
      newCityName = "광주광역시";
      break;
    case "대전":
    case "대전광역시":
      shortCityName = "대전";
      newCityName = "대전광역시";
      break;
    case "대구":
    case "대구광역시":
      shortCityName = "대구";
      newCityName = "대구광역시";
      break;
    case "부산":
    case "부산광역시":
      shortCityName = "부산";
      newCityName = "부산광역시";
      break;
    case "울산":
    case "울산광역시":
      shortCityName = "울산";
      newCityName = "울산광역시";
      break;
    case "경기":
    case "경기도":
      shortCityName = "경기";
      newCityName = "경기도";
      break;
    case "강원":
    case "강원도":
      shortCityName = "강원";
      newCityName = "강원도";
      break;
    case "경남":
    case "경상남도":
      shortCityName = "경남";
      newCityName = "경상남도";
      break;
    case "전남":
    case "전라남도":
      shortCityName = "전남";
      newCityName = "전라남도";
      break;
    case "전북":
    case "전라북도":
      shortCityName = "전북";
      newCityName = "전라북도";
      break;
    case "경북":
    case "경상북도":
      shortCityName = "경북";
      newCityName = "경상북도";
      break;
    case "충북":
    case "충청북도":
      shortCityName = "충북";
      newCityName = "충청북도";
      break;
    case "충남":
    case "충청남도":
      shortCityName = "충남";
      newCityName = "충청남도";
      break;
    case "세종":
    case "세종특별자치시":
      shortCityName = "세종";
      newCityName = "세종특별자치시";
      break;
    case "제주":
    case "제주특별자치도":
      shortCityName = "제주";
      newCityName = "제주특별자치도";
      break;
    // case '제주':
    //   newCityName = '제주도';
    //   break;
  }

  let allAddress = "";
  if (splitAddress.length == 4) {
    allAddress =
      newCityName +
      " " +
      splitAddress[1] +
      " " +
      splitAddress[2] +
      " " +
      splitAddress[3];
  } else if (splitAddress.length == 5) {
    allAddress =
      newCityName +
      " " +
      splitAddress[1] +
      " " +
      splitAddress[2] +
      " " +
      splitAddress[3] +
      " " +
      splitAddress[4];
  } else if (splitAddress.length == 3) {
    allAddress = newCityName + " " + splitAddress[1] + " " + splitAddress[2];
  }
  let result = [shortCityName, allAddress]

  return result;
};

module.exports = standard_name;
