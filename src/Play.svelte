<script>
import { onMount } from "svelte";
let src = './Assests/j.jpg'
let errorplanet = null;
let errorvehicles = null;

$: planets = undefined;
$: vehicles = [];
onMount (async()=>{
    await fetch('https://findfalcone.herokuapp.com/planets')
    .then(res=>res.json())
    .then(res=>{
        planets=res;
        console.log(planets)
        planets.forEach(function (element) {
  element.Active = src.map(x=>x.img);
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
        console.log(vehicles)

    })
    .catch(err=>{
        errorvehicles=err;
    })
})

</script>
<style>
    .maindiv {
       
    }
    .available{
        display: flex;
        flex-direction: column;
        flex-basis: 25%;
    }
    h1{
        color:white;
    }
</style>

<div class="maindiv">
   
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



