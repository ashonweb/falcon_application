<script>
import { onMount } from "svelte";
import cloneDeep from 'clone-deep';
let src = './Assests/j.jpg';
let scoops = 1;

let errorplanet = null;
let errorvehicles = null;

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
$: selectedId = null;
$: vehiclearray_modified=[];
$: vehiclearray_modified_second=[];
$: selectedsecondradio=null;
$: showsecondradio=false

onMount (async()=>{
    await fetch('https://findfalcone.herokuapp.com/planets')
    .then(res=>res.json())
    .then(res=>{
      
        planets=res;
        console.log(planets)
        planets.forEach(function (element) {
  element.Active = "false";
});
        console.log(planets)

                
    })
    .catch(err=>{
        errorplanet=err;
    })
    await fetch('https://findfalcone.herokuapp.com/vehicles')
    .then(res=>res.json())
    .then(res=>{
        vehicles=res;
        vehiclearray_modified=res
        console.log(vehicles)

    })
    .catch(err=>{
        errorvehicles=err;
    })
})

const handlechange =(value)=>{
    showthirddestination=false;
    showfourthdestination=false;

    selectedvaluesecond='';
    if(secondArray === undefined){
         secondArray = planets.filter(function( obj ) {
        showseconddestination = true;
    return obj.name !== value;
    });
    }
  
    else if (secondArray.length !==0 ){
        secondArray = [];
        showseconddestination = false;
        secondArray = planets.filter(function( obj ) {
            setTimeout(function(){
                showseconddestination=true

            },3000)
        return obj.name !== value;
      }); 
}

}
const handlesecondchange =(fvalue,svalue)=>{
    showfourthdestination=false;
    selectedvaluethird='';

    if(thirdArray === undefined){
        thirdArray = planets.filter(function( obj ) {
        showthirddestination = true;
    return obj.name !== fvalue && obj.name !== svalue;
    });
    console.log(thirdArray)

    }
  
    else if (thirdArray.length !==0 ){
        thirdArray = [];
        showthirddestination = false;
        thirdArray = planets.filter(function( obj ) {
            setTimeout(function(){
                showthirddestination=true
            },3000)
        return obj.name !== fvalue && obj.name !== svalue;
      }); 
      console.log(thirdArray)

}

}
const handlethirdchange =(fvalue,svalue,tvalue)=>{
   

    if(fourthArray === undefined){
        fourthArray = planets.filter(function( obj ) {
        showfourthdestination = true;
    return obj.name !== fvalue && obj.name !== svalue && obj.name !== tvalue;
    });
    console.log(fourthArray)

    }
  
    else if (fourthArray.length !==0 ){
        fourthArray = [];
        showfourthdestination = false;
        fourthArray = planets.filter(function( obj ) {
            setTimeout(function(){
                showfourthdestination=true
            },3000)
        return obj.name !== fvalue && obj.name !== svalue && obj.name !== tvalue;
      }); 
      console.log(fourthArray)

}

}
const handlenumbers =(name,no)=>{
    showsecondradio=false

    let obj = vehicles;
let arr = obj;
let copy = cloneDeep(arr);
    console.log(copy)
   copy.filter(function (obj){
       if(obj.name === name)
       obj.total_no = no-1
       return obj
   })
   vehiclearray_modified = copy
   
}

const handlesecondnumbers =(name,no)=>{
    showsecondradio=true
    console.log(name,no)
    let obj = vehiclearray_modified;

let arr = obj;
let copy = cloneDeep(arr);
    console.log(copy)
   copy.filter(function (obj){
       if(obj.name === name)
       obj.total_no = no-1
       return obj
   })
   vehiclearray_modified_second = copy
}
const nj =(name,no)=>{
    alert("kjkjkj")
}
</script>
<style>
    
    h1{
        color:white;
    }
    .label{
        color:white
    }
    
</style>

<div class="maindiv">
   <h1>bj</h1>
   <div>
        <select bind:value={selectedvalue} on:change={()=>handlechange(selectedvalue)}>
            {#if Array.isArray(planets)}
                { #each planets as {name,distance},i  }
                <option hidden selected>Select one...</option>

                        <option value={name}  >
                                {name}
                        </option> 
                {/each}
                {:else}
                {#if errorplanet !== null}
                    <p>kfsfh</p>
                    {:else}
                    <p>sdsdsdsdsd</p>
                {/if}
            {/if}
        </select> 
        {#if selectedvalue !== ''}
            {#if Array.isArray(vehiclearray_modified)}
                { #each vehiclearray_modified as {name,total_no},i  }
                    
                        <label on:click class='label' for={name}>
                        <input type="radio" bind:group={selectedId} value={name} id={name} on:change={()=>handlenumbers(name,total_no)} />
                    {name} ({total_no})
                    </label>
                    
                {/each}
            {:else}
                {#if errorvehicles !== null}
                    <p>kfsfh</p>
                    {:else}
                    <p>sdsdsdsdsd</p>
                {/if}
            {/if}
        {/if}
       
    </div>
    <div>
       {#if showseconddestination}
            <select bind:value={selectedvaluesecond} on:change={()=>handlesecondchange(selectedvalue,selectedvaluesecond)}>
                {#if Array.isArray(secondArray)}
                    { #each secondArray as {name,distance},i  }
                    <option hidden selected>Select two...</option>

                            <option value={name} >
                                    {name}
                            </option> 
                    {/each}
                
                {/if}
            </select> 
            {#if selectedvaluesecond !== ''}
                {#if showsecondradio}
                        { #each vehiclearray_modified_second as {name,total_no},i  }
                            <label>
                                
                            <input type="radio" bind:group={selectedsecondradio} value={name} id={name} on:change={()=>handlesecondnumbers(name,total_no)} />{name} {total_no}
                            </label>
                        {/each}
                    {:else}
                        { #each vehiclearray_modified as {name,total_no},i  }
                            <label>
                            <input type="radio" bind:group={selectedsecondradio} value={name} id={name} on:change={()=>handlesecondnumbers(name,total_no)} />{name} {total_no}
                            </label>
                        {/each}
                {/if}
            {/if}
       {/if}
      
    </div>
      <!--  {#if showthirddestination}

           <select bind:value={selectedvaluethird} on:change={()=>handlethirdchange(selectedvalue,selectedvaluesecond,selectedvaluethird)}>
            {#if Array.isArray(thirdArray)}
                { #each thirdArray as {name,distance},i  }
                <option hidden selected>Select third...</option>

                        <option value={name} >
                                {name}
                        </option> 
                {/each}
               
            {/if}
        </select>  
       {/if}
       {#if showfourthdestination}

           <select bind:value={selectedvaluefourth}>
            {#if Array.isArray(fourthArray)}
                { #each fourthArray as {name,distance},i  }
                <option hidden selected>Select fourth...</option>

                        <option value={name} >
                                {name}
                        </option> 
                {/each}
               
            {/if}
        </select>  
       {/if}
          -->
       
        <h1>Available Vehicles</h1>
        
        
        <h1>Available Vehicles</h1>
    



        <div>
            {#if Array.isArray(planets)}
            { #each planets as {name,distance},i  }
                
                <div>
                    <h2>
                        {name}
                    </h2>
                    <p>{distance}</p>
                </div>
                   
               
            {/each}
              
                {:else}
                {#if errorplanet !== null}
                    <p>kfsfh</p>
                    {:else}
                    <p>sdsdsdsdsd</p>
                {/if}
            {/if}
        </div>

</div>



