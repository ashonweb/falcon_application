<script>
    import { onMount } from "svelte";
    import cloneDeep from 'clone-deep';
    
    console.log(process.env.client_id)
    let src = './Assests/vehicles_hideouts.png';
    let scoops = 1;
    
    let errorplanet = null;
    let errorvehicles = null;
    $: disabled=false;
    $: planets = undefined;
    $: selectedvalue='';
    //second
    $: selectedvaluesecond='';
    $: showseconddestination =false;
    $: secondArray = undefined;
    //thrid
    $: selectedvaluethird='';
    $: showthirddestination =false;
    $: thirdArray = undefined;
    //fourth
    $: selectedvaluefourth='';
    $: showfourthdestination =false;
    $: fourthArray = undefined;
    
    $: vehicles = [];
    $: vehiclearray_modified=[];
    $: vehiclearray_modified_second=[];
    $: vehiclearray_modified_third=[];
    $: vehiclearray_modified_fourth=[];
    
    $: selectedfirstradio = null;
    $: selectedsecondradio=null;
    $: selectedthirdradio=null;
    $: selectedfourthradio=null;
    
    $: showfirstradio=false;
    $: showsecondradio=false;
    $: showthirdradio=false;
    $: showfourthradio=false;
    $: time=0;
    $: finalplanets=[];
    $: finalvehicles=[];
    
    onMount (async()=>{
        await fetch('https://findfalcone.herokuapp.com/planets')
        .then(res=>res.json())
        .then(res=>{
          
            planets=res;
            planets.forEach(function (element) {
                element.Active = "false";
            });
        })
        .catch(err=>{
            errorplanet=err;
        })
        await fetch('https://findfalcone.herokuapp.com/vehicles')
        .then(res=>res.json())
        .then(res=>{
            vehicles=res;
            vehiclearray_modified=res
            console.log(vehicles,"da")
        })
        .catch(err=>{
            errorvehicles=err;
        })
    })
    
    const handlechange =(value)=>{
        finalplanets=[]
        showthirddestination=false;
        showfourthdestination=false;
        selectedvaluesecond='';
        showfirstradio = true;
        selectedfirstradio=null;
        if(secondArray === undefined){
             secondArray = planets.filter(function( obj ) {
            // showseconddestination = true;
        return obj.name !== value;
        });
        }
      
        else if (secondArray.length !==0 ){
            secondArray = [];
            showseconddestination = false;
            secondArray = planets.filter(function( obj ) {
                // setTimeout(function(){
                //     showseconddestination=true
    
                // },3000)
            return obj.name !== value;
          }); 
    }
    
    }
    
    const handlenumbers =(name,no,speed)=>{
        time=speed;
        finalvehicles.push(name)
        console.log(name)
        showsecondradio=false
        let obj = vehicles;
        let arr = obj;
        let copy = cloneDeep(arr);
        copy.filter(function (obj){
           if(obj.name === name)
           obj.total_no = no-1;
            // showseconddestination = true;
                showseconddestination=true
           return obj
       })
       vehiclearray_modified = copy
       
    }



    const handlesecondchange =(fvalue,svalue)=>{
        finalplanets=[]
            showfourthdestination=false;
            selectedvaluethird='';
            showsecondradio = true;
            selectedsecondradio=null;

            if(thirdArray === undefined){
                thirdArray = planets.filter(function( obj ) {

                // showthirddestination = true;
                return obj.name !== fvalue && obj.name !== svalue;
            });
            }
            else if (thirdArray.length !==0 ){
                thirdArray = [];
                showthirddestination = false;
                thirdArray = planets.filter(function( obj ) {
                    // setTimeout(function(){
                    //     showthirddestination=true
                    // },3000)
                return obj.name !== fvalue && obj.name !== svalue;
            }); 

        }

    }

    const handlesecondnumbers =(name,no,speed)=>{
            time = time+speed;
            finalvehicles.push(name)
        console.log(name)
            showsecondradio=false
            let obj = vehiclearray_modified;
            let arr = obj;
            let copy = cloneDeep(arr);
            copy.filter(function (obj){
            if(obj.name === name)
           if(obj.total_no === 0){
            obj.total_no = 0; 

           }
           else{
            obj.total_no = no-1; 
            showthirddestination = true;
           }
            

            return obj
        })
        vehiclearray_modified_second = copy
    
        
    }

    const handlethirdchange =(fvalue,svalue,tvalue)=>{
        finalplanets=[]
        selectedvaluefourth='';
        showthirdradio = true;
        selectedthirdradio=null;
        if(fourthArray === undefined) {
            fourthArray = planets.filter(function( obj ) {
                // showfourthdestination = true;
            return obj.name !== fvalue && obj.name !== svalue && obj.name !== tvalue;
            });

            }
            
        else if (fourthArray.length !==0 ){
                fourthArray = [];
                showfourthdestination = false;
                fourthArray = planets.filter(function( obj ) {
                    // setTimeout(function(){
                    //     showfourthdestination=true
                    // },3000)
                return obj.name !== fvalue && obj.name !== svalue && obj.name !== tvalue;
                }); 

        }

    }
    const handlethirdnumbers =(name,no,speed)=>{
        time = time+speed;
        finalvehicles.push(name)
        console.log(name)

            showthirdradio=false
            let obj = vehiclearray_modified_second;
            let arr = obj;
            let copy = cloneDeep(arr);
            copy.filter(function (obj){
            if(obj.name === name)
           if(obj.total_no === 0){
            obj.total_no = 0; 
           }
           else{
            obj.total_no = no-1; 

           }
            showfourthdestination = true;

            return obj
        })
        vehiclearray_modified_third = copy
    }
    const handlefourthchange =(selectedvalue,selectedvaluesecond,selectedvaluethird,selectedvaluefourth)=>{
        finalplanets.push(selectedvalue,selectedvaluesecond,selectedvaluethird,selectedvaluefourth)
        console.log(finalplanets)
        console.log(selectedvalue,selectedvaluesecond,selectedvaluethird,selectedvaluefourth)
        showfourthradio = true;
        selectedfourthradio=null;
    }
    const handlefourthnumbers =(name,no,speed)=>{
        time = time+speed;
        finalvehicles.push(name)
        console.log(name,finalvehicles)

            showfourthradio=false
            let obj = vehiclearray_modified_third;
            let arr = obj;
            let copy = cloneDeep(arr);
            copy.filter(function (obj){
            if(obj.name === name)
           if(obj.total_no === 0){
            obj.total_no = 0; 
           }
           else{
            obj.total_no = no-1; 

           }

            return obj
        })
        vehiclearray_modified_fourth = copy
    }

</script>
<style>
        label{
            text-align: left;
            padding:10px
        }
    h1{
        color:white;
    }
    .label{
        color:white
    }
    .maindiv {
        display:flex;
        margin:0 30px;
        justify-content: space-evenly;
    }
    .startpage{
        min-height: 100%;
        background: linear-gradient(30deg,#000,transparent)

    }
    
</style>
    <div class="startpage">
        <img src={src} alt='not available' height="50%" width="50%"/>
        <h1>Select the Planet you want to search the Queen in</h1>
        <div class="maindiv">
    <p>{time}</p>
    <div>
        
        <select bind:value={selectedvalue} on:change={()=>handlechange(selectedvalue)}>
            {#if Array.isArray(planets)}
                { #each planets as {name,distance},i  }
                <option hidden selected>Select First Planet</option>

                        <option value={name}  >
                                {name}
                        </option> 
                {/each}
                {:else}
                {#if errorplanet !== null}
                    <p>Loading</p>
                    {:else}
                    <p>SOmething went wrong</p>
                {/if}
            {/if}
        </select> 
        {#if selectedvalue !== ''}
            {#if showfirstradio !== false}
                {#if Array.isArray(vehiclearray_modified)}
                    { #each vehiclearray_modified as {name,total_no,speed},i  }
                            <label on:click class='label' for={name}>
                            <input type="radio" bind:group={selectedfirstradio} value={name} id={name} on:change={()=>handlenumbers(name,total_no,speed)} />
                                {name} ({total_no}) {speed}
                            </label>
                        
                    {/each}
                    {:else}
                    {#if errorvehicles !== null}
                        <p>Loading</p>
                        {:else}
                        <p>SOmething</p>
                    {/if}
                {/if}
            {/if}               
        {/if}
        
    </div>
    <div>
        {#if showseconddestination}
            <select bind:value={selectedvaluesecond} on:change={()=>handlesecondchange(selectedvalue,selectedvaluesecond)}>
                {#if Array.isArray(secondArray)}
                    { #each secondArray as {name,distance},i  }
                    <option hidden selected>Select Second Planet</option>

                            <option value={name} >
                                    {name}
                            </option> 
                    {/each}
                
                {/if}

            </select>

                {#if selectedvaluesecond !== ''}
                    {#if showsecondradio === false}
                            { #each vehiclearray_modified_second as {name,total_no,speed},i  }
                                    {#if total_no === 0}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedsecondradio} value={name} id={name} on:change={()=>handlesecondnumbers(name,total_no,speed)}  />{name} {total_no}
                                </label>
                                    {:else}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedsecondradio} value={name} id={name}  on:change={()=>handlesecondnumbers(name,total_no),speed} />{name} {total_no}
                                </label>
                                    {/if}
                            
                            {/each}
                            {:else}
                            <p>else</p>
                                { #each vehiclearray_modified as {name,total_no,speed},i  }
                                {#if total_no === 0}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedsecondradio} value={name} id={name} />{name} {total_no}
                            </label>
                                {:else}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedsecondradio} value={name} id={name}  on:change={()=>handlesecondnumbers(name,total_no,speed)} />{name} {total_no}
                            </label>
                                {/if}
                                {/each}
                    {/if}
                {/if}




        {/if}
    </div>
    
    
    <div>
        {#if showthirddestination}

            <select bind:value={selectedvaluethird} on:change={()=>handlethirdchange(selectedvalue,selectedvaluesecond,selectedvaluethird)}>
                {#if Array.isArray(thirdArray)}
                    { #each thirdArray as {name,distance},i  }
                    <option hidden selected>Select third Planet</option>

                            <option value={name} >
                                    {name}
                            </option> 
                    {/each}
                
                {/if}

            </select>

                {#if selectedvaluethird !== ''}
                    {#if showthirdradio === false}
                            { #each vehiclearray_modified_third as {name,total_no,speed},i  }
                                    {#if total_no === 0}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedthirdradio} value={name} id={name} on:change={()=>handlethirdnumbers(name,total_no,speed)} />{name} {total_no}
                                </label>
                                    {:else}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedthirdradio} value={name} id={name}  on:change={()=>handlethirdnumbers(name,total_no,speed)} />{name} {total_no}
                                </label>
                                    {/if}
                            
                            {/each}
                            {:else}
                                { #each vehiclearray_modified_second as {name,total_no,speed},i  }
                                {#if total_no === 0}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedthirdradio} value={name} id={name}  />{name} {total_no}
                            </label>
                                {:else}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedthirdradio} value={name} id={name}  on:change={()=>handlethirdnumbers(name,total_no,speed)} />{name} {total_no}
                            </label>
                                {/if}
                                {/each}
                    {/if}
                {/if}




        {/if}
    </div>
    <div>
        {#if showfourthdestination}
        <select bind:value={selectedvaluefourth} on:change={()=>handlefourthchange(selectedvalue,selectedvaluesecond,selectedvaluethird,selectedvaluefourth)}>
            {#if Array.isArray(fourthArray)}
                { #each fourthArray as {name,distance},i  }
                <option hidden selected>Select fourth planet</option>

                        <option value={name} >
                                {name}
                        </option> 
                {/each}
            
            {/if}
        </select> 
        {#if selectedvaluefourth !== ''}
                    {#if showfourthradio === false}
                            { #each vehiclearray_modified_fourth as {name,total_no,speed},i  }
                                    {#if total_no === 0}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedfourthradio} value={name} id={name} on:change={()=>handlefourthnumbers(name,total_no,speed)} />{name} {total_no}
                                </label>
                                    {:else}
                                    <label class='label'>

                                    <input type="radio" bind:group={selectedfourthradio} value={name} id={name}  on:change={()=>handlefourthnumbers(name,total_no,speed)} />{name} {total_no}
                                </label>
                                    {/if}
                            
                            {/each}
                            {:else}
                                { #each vehiclearray_modified_third as {name,total_no,speed},i  }
                                {#if total_no === 0}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedfourthradio} value={name} id={name}  />{name} {total_no}
                            </label>
                                {:else}
                                <label class='label'>
                    
                                <input type="radio" bind:group={selectedfourthradio} value={name} id={name}  on:change={()=>handlefourthnumbers(name,total_no,speed)} />{name} {total_no}
                            </label>
                                {/if}
                                {/each}
                    {/if}
                {/if}

        {/if}
    </div>  
        
        
</div>
<button on:click="">Find the Queen</button>

</div>


