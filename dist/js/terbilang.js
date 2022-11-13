function terbilang(a){
	var bilangan = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];

	// 1 - 11
	if(a < 12){
		var kalimat = bilangan[a];
	}
	// 12 - 19
	else if(a < 20){
		var kalimat = bilangan[a-10]+' belas';
	}
	// 20 - 99
	else if(a < 100){
		var utama = a/10;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%10;
		var kalimat = bilangan[depan]+' puluh '+bilangan[belakang];
	}
	// 100 - 199
	else if(a < 200){
		var kalimat = 'seratus '+ terbilang(a - 100);
	}
	// 200 - 999
	else if(a < 1000){
		var utama = a/100;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%100;
		var kalimat = bilangan[depan] + ' ratus '+ terbilang(belakang);
	}
	// 1,000 - 1,999
	else if(a < 2000){
		var kalimat = 'seribu '+ terbilang(a - 1000);
	}
	// 2,000 - 9,999
	else if(a < 10000){
		var utama = a/1000;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%1000;
		var kalimat = bilangan[depan] + ' ribu '+ terbilang(belakang);
	}
	// 10,000 - 99,999
	else if(a < 100000){
		var utama = a/100;
		var depan = parseInt(String(utama).substr(0,2));
		var belakang = a%1000;
		var kalimat = terbilang(depan) + ' ribu '+ terbilang(belakang);
	}
	// 100,000 - 999,999
	else if(a < 1000000){
		var utama = a/1000;
		var depan = parseInt(String(utama).substr(0,3));
		var belakang = a%1000;
		var kalimat = terbilang(depan) + ' ribu '+ terbilang(belakang);
	}
	// 1,000,000 - 	99,999,999
	else if(a < 100000000){
		var utama = a/1000000;
		var depan = parseInt(String(utama).substr(0,4));
		var belakang = a%1000000;
		var kalimat = terbilang(depan) + ' juta '+ terbilang(belakang);
	}
	else if(a < 1000000000){
		var utama = a/1000000;
		var depan = parseInt(String(utama).substr(0,4));
		var belakang = a%1000000;
		var kalimat = terbilang(depan) + ' juta '+ terbilang(belakang);
	}
	else if(a < 10000000000){
		var utama = a/1000000000;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%1000000000;
		var kalimat = terbilang(depan) + ' milyar '+ terbilang(belakang);
	}
	else if(a < 100000000000){
		var utama = a/1000000000;
		var depan = parseInt(String(utama).substr(0,2));
		var belakang = a%1000000000;
		var kalimat = terbilang(depan) + ' milyar '+ terbilang(belakang);
	}
	else if(a < 1000000000000){
		var utama = a/1000000000;
		var depan = parseInt(String(utama).substr(0,3));
		var belakang = a%1000000000;
		var kalimat = terbilang(depan) + ' milyar '+ terbilang(belakang);
	}
	else if(a < 10000000000000){
		var utama = a/10000000000;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%10000000000;
		var kalimat = terbilang(depan) + ' triliun '+ terbilang(belakang);
	}
	else if(a < 100000000000000){
		var utama = a/1000000000000;
		var depan = parseInt(String(utama).substr(0,2));
		var belakang = a%1000000000000;
		var kalimat = terbilang(depan) + ' triliun '+ terbilang(belakang);
	}

	else if(a < 1000000000000000){
		var utama = a/1000000000000;
		var depan = parseInt(String(utama).substr(0,3));
		var belakang = a%1000000000000;
		var kalimat = terbilang(depan) + ' triliun '+ terbilang(belakang);
	}

  else if(a < 10000000000000000){
		var utama = a/1000000000000000;
		var depan = parseInt(String(utama).substr(0,1));
		var belakang = a%1000000000000000;
		var kalimat = terbilang(depan) + ' kuadriliun '+ terbilang(belakang);
	}

	var pisah = kalimat.split(' ');
	var full = [];
	for(var i=0;i<pisah.length;i++){
	 if(pisah[i] != ""){full.push(pisah[i]);}
	}
	return full.join(' ');
}