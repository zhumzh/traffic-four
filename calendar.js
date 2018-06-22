/**
* state
* 0 没有任何状态
* 1 行
* 2 停
* 3 违法
* 4 法定节假日不可点击
* 5 7月1号之前新规未实施不可点击
*/									

// 变量集中声明
var $calendar = $('#calendar'),
	$headYear = $('#calendar .year'),
	$headMonth = $('#calendar .month'),
	$prev = $('#calendar .prev'),
	$next = $('#calendar .next'),
	$ul = $('#calendar ul');

// 节假日
var holiday = {
	// '10-1' : '国庆节',
	// '10-2' : '休',
	// '10-3' : '休',
	// '10-4' : '休',
	// '10-5' : '休',
	// '7-16' : '休test'
}
// 小于7-1号时间戳，state=5不可点击
var startTamp = new Date(2018,6,1).getTime()

// 获取今天的年月日
var today = new Date(),
	nowYear = today.getFullYear(),
	nowMonth = today.getMonth();

// 当天为7-1之前，日期设置在7-1号
if(new Date().getTime() < startTamp){
	nowYear = 2018
	nowMonth = 6
}
// 年月回填页面
$headYear.text(nowYear);
$headMonth.text(nowMonth+1);
setDate(nowYear,nowMonth)

$prev.click(function(){
	// 还需要加判断 month减到小于0就减year 下同
	--nowMonth;
	$headYear.text(nowYear);
	$headMonth.text(nowMonth+1);
	setDate(nowYear,nowMonth)
})
$next.click(function(){
	++nowMonth;
	$headYear.text(nowYear);
	$headMonth.text(nowMonth+1);
	setDate(nowYear,nowMonth)
})

// 生成日历
function setDate(year,month){
	// 计算当前月一号是星期几
	var firstDay = new Date(year,month,1).getDay();
	// 这个月有多少天
	var thisMonthDays = new Date(year,month+1,0).getDate();
	// 上个月有多少天
	var lastMonthDays = new Date(year,month,0).getDate();
	var dateHtml = '';

	//计算前面的
	for(var i = firstDay; i > 0;i--){
		var mm = nowMonth - 1;
		var dd = lastMonthDays - i + 1;
		var tamp = new Date(year,month-1,dd).getTime();
		if(tamp<startTamp){
			state = 5;
		}
		dateHtml += '<li class="item" data-state="'+state+'" data-month="'+mm+'" data-day="'+dd+'" data-tamp="'+tamp+'"><span>'+dd+'</span></li>';
	}
	// 这个月的
	for(var i = 1;i<= thisMonthDays;i++){
		var tamp = new Date(year,month,i).getTime(),
			isHoliday = false,
			state = 0;
		if(tamp<startTamp){
			state = 5;
		}
		var holidayText = '';
		var dateText = parseInt(month+1)+'-'+i
		$.each(holiday,function(key,val){
            // 遍历节假日这个对象
            if(dateText == key){
            	isHoliday = true
                //找到相对应的key，就把节假日名称复制给festivalText
                holidayText = val
                return
            }
        })
        if(tamp == startTamp){
        	holidayText = '执行首日'
        	dateHtml += '<li class="item holiday" data-state="'+state+'" data-month="'+month+'" data-day="'+i+'" data-tamp="'+tamp+'"><span>'+i+'</span><i>'+holidayText+'</i></li>';
        }else if(isHoliday){
        	// 法定节假日不可点击
        	state = 4;
        	dateHtml += '<li class="item holiday" data-state="'+state+'" data-month="'+month+'" data-day="'+i+'" data-tamp="'+tamp+'"><span>'+i+'</span><i>'+holidayText+'</i></li>';
        }else{
        	dateHtml += '<li class="item" data-state="'+state+'" data-month="'+month+'" data-day="'+i+'" data-tamp="'+tamp+'"><span>'+i+'</span></li>';
        }
		
	}
	// 计算后面的
	var weekEnd = new Date(year,month,thisMonthDays).getDay()//最后一天是周几
    for(var i=1;weekEnd<6;i++){
    	var mm = month+1;
    	var tamp = new Date(year,month+1,i).getTime();
    	if(tamp<startTamp){
			state = 5;
		}
        dateHtml += '<li class="item" data-state="'+state+'" data-month="'+mm+'" data-day="'+dd+'" data-tamp="'+tamp+'"><span>'+i+'</span></li>';
        weekEnd++;
    }
	$ul.html(dateHtml)

	// 开四停四交通规则
	trafficRule()
}

function trafficRule(){
	var $item = $calendar.find('li.item')
	/**
	 * state
	 * 0 没有任何状态
	 * 1 行
	 * 2 停
	 * 3 违法
	 * 4 法定节假日不可点击
	 * 5 7月1号之前新规未实施不可点击
	 */
	$item.click(function(){
		var $this = $(this),
			index = $this.index();
		if($this.data('state')==4 ||$this.data('state')==5){
			// 法定节假日or7-1之前
			return

		}else if($this.data('state')==0){
			// 没有任何状态
			$this.addClass('act')
			$this.data('state',1)
			if($item.eq(index+4).data('state')==4){
				return
			}else{
				$item.eq(index+4).addClass('stop')
				$item.eq(index+4).data('state',2)
			}

			// 这一段比较乱 算法不过关
			var flag = false;
			for(var i=1;i<4;i++){
				if($item.eq(index-i).data('state')==1){
					flag = i
				}
			}
			if(flag){
				for(var i =1;i<flag;i++){
					if($item.eq(index-i).data('state')==0){
						if($item.eq(index-i+4).data('state')==4){
							return
						}else{
							$item.eq(index-i+4).addClass('stop')
							$item.eq(index-i+4).data('state',2)
						}	
					}
				}
			}
			
		}else if($this.data('state')==1){
			// 当前为行,再次点击变为无状态
			$this.removeClass('act')
			$this.data('state',0)
			$item.eq(index+4).removeClass('stop')
			$item.eq(index+4).data('state',0)
			// 这一段比较乱 算法不过关
			var flag = 0;
			for(var i=1;i<3;i++){
				if(index-i < 0) return
				if($item.eq(index-i).data('state')==0){
					flag++
				}
			}
			if(flag){
				for(var i =1;i<=flag;i++){
					if($item.eq(index-i+4).data('state')==2){
						if($item.eq(index-i+4).data('state')==4){
							return
						}else{
							$item.eq(index-i+4).removeClass('stop')
							$item.eq(index-i+4).data('state',0)
						}	
					}
				}
			}

		}else if($this.data('state')==2){
			// 当前为停，再次点击变为违法，后面四天都停
			$this.addClass('wrong')
			$this.data('state',3)
			for(var i =0;i<=4;i++){
				if($item.eq(index+i).data('state')==4){
					return
				}else{
					$item.eq(index+i).addClass('stop')
					$item.eq(index+i).data('state',2)
				}	
			}
			
		}else if($this.data('state')==3){
			//当前违法，再次点击，变为停，后面四个停去掉
			$this.addClass('stop')
			$this.data('state',2)
			for(var i =0;i<=4;i++){
				if($item.eq(index+i-4).data('state')==1){
					return
				}else{
					$item.eq(index+i).removeClass('stop')
					$item.eq(index+i).data('state',0)
				}	
			}
		}
	})
}
