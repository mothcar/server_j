
let common       = {}

common.getToday = () =>{
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minites = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    var obj = {
        date: year + '-' + month + '-' + day,
        time: hour + ':' + minites + ':' + seconds
    }

    return obj;
}



common.setJwtToken = (tmp_data)=>{

    const jwt = require('jsonwebtoken');
    const jwt_secret_key = 'cycon1234!@#$';

    var now = new Date();
    var tomorrow = new Date(now.setDate(now.getDate() + 1));

    const obj = jwt.sign({ user_id: tmp_data._id, uid: tmp_data.uid, user_name: tmp_data.user_name, user_email: tmp_data.user_email, expire_date: tomorrow}, jwt_secret_key);

    return obj
}

common.getJwtToken = (access_token)=>{

    const jwt = require('jsonwebtoken');
    const jwt_secret_key = 'cycon1234!@#$';

    var decoded = null;
    try{
        decoded = jwt.verify(access_token, jwt_secret_key);
    }catch(ex){
        decoded = null
    }
    
    // console.log('decoded access_token', decoded)

    return decoded
}

common.signUpReward =  1000
common.reward =  1000

module.exports = common
