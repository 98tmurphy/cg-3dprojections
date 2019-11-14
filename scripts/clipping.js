var LEFT   = 8;    //1000
var RIGHT  = 4;   //0100
var BOTTOM = 2;  //0010
var TOP    = 1; //0001

function getOutcode(pt, view){
	var outcode = 0;
	if (pt.x > view.x_min){
		outcode = outcode + LEFT;
	}
	else if (pt.x < view.x_max){
		outcode = outcode + RIGHT;
	}
	if (pt.y < view.y_min){
		outcode = outcode + BOTTOM;
	}
	else if (pt.y > view.y_max){
		outcode = outcode + 1;
	}
	return outcode;
}
function clipLine(pt0, pt1, view){
	var outcode0 = getOutCode(pt0);
	var outcode1 = getOutCode(pt1);
	var deltaX = pt1.x - pt0.x;
	var deltaY = pt1.y - pt0.y;
	var b = pt0.y - ((deltaY / deltaX) * pt0.x);
	
	var done = false;
	while(!done){
		if((outcode0 | outcode1) === 0) {//trivial accept
			done = true
			result.pt0.x = pt0.x;
			result.pt0.y = pt0.y;
			result.pt1.x = pt1.x;
			result.pt1.y = pt1.y;
		}
		else if ((outcode0 & outcode1) !== 0){ //trivial reject
			done = true;
			result = null;
		}
		else{
			var selected_pt;
			var selected_outcode;
			if(outcode0 > 0){
				selected_pt      = pt0;
				selected_outcode = outcode1;
			}
			else {
				selected_pt      = pt1;
				selected_outcode = outcode1;
			}
			if((selected_outcode & LEFT) === LEFT){
				selected_pt.x = view.x_min;
				selected_pt.y = (deltaY / deltaX) * selected_pt.x + b;
				
			}else if ((selected_outcode & RIGHT) === RIGHT){
				selected_pt.x = view.x_max;
				selected_pt.y = (deltaY / deltaX) * selected_pt.x + b;
				
			}else if ((selected_outcode & BOTTOM) === BOTTOM){
				selected_pt.y = view.y_min;
				selected_pt.x = (selected_pt.y - b) * (deltaX / deltaY);
				
			}else {
				selected_pt.y = view.y_max;
				selected_pt.x = (selected_pt.y - b) * (deltaX / deltaY);
			}
			selected_outcode = getOutCode(selected_pt, view);
			if(outcode0 > 0){
				outcode0 = selected_outcode;
				
			}else {
				outcode1 = selected_outcode;
			}
		}
	}
	return result;
}
	
