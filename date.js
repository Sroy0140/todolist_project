exports.getDate=function(){
    let today=new Date();
    let options={
        weekday:"long",
        day:"numeric",
        month:"long"
    };

    let date=today.toLocaleDateString("en-IN", options);
    return date;
}

exports.getDay =function(){
    let today=new Date();
    let options={
        weekday:"long"
    };
    let day=today.toLocaleDateString("en-IN", options);
    return day;
}
