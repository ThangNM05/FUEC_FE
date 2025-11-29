import { Button } from '@/components/ui/button';

import { useAppDispatch,useAppSelector  } from '@/hooks/redux';

import { useGetPokemonByNameQuery } from '../service';
import { decrement , increment } from '../slice';

function BookingArea() {
  const count = useAppSelector((state) => state.booking.value);
  const dispatch = useAppDispatch();

  const { data, error, isLoading } = useGetPokemonByNameQuery('pikachu');
  console.log('🚀 ~ BookingArea ~ data:', data);

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center">
      <p className="text-2xl font-bold mb-10">Booking Area</p>
      <div className="mb-10">
        <div className="flex items-center justify-center">
          <Button aria-label="Increment value" onClick={() => dispatch(increment())}>
            Increment
          </Button>
          <p className="text-2xl font-bold mx-10">{count}</p>
          <Button aria-label="Decrement value" onClick={() => dispatch(decrement())}>
            Decrement
          </Button>
        </div>
      </div>
      {error ? (
        <>Oh no, there was an error</>
      ) : isLoading ? (
        <>Loading...</>
      ) : data ? (
        <>
          <h3>{data.species.name}</h3>
          <img src={data.sprites.front_shiny} alt={data.species.name} />
        </>
      ) : null}
    </div>
  );
}

export default BookingArea;
