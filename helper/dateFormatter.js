
module.exports = {
    changeFormatDate: (birthdate) => {
        let date = new Date(birthdate);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let dt = date.getDate();
    
        if (dt < 10) {
        dt = '0' + dt;
        }
        if (month < 10) {
        month = '0' + month;
        }
        
        let newDate = `${year}-${month}-${dt}`
        console.log(newDate)
    
        return newDate    
    }
}