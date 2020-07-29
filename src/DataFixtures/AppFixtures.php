<?php

namespace App\DataFixtures;

use App\Entity\Verb;
use GuzzleHttp\Client as GuzzleClient;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class AppFixtures extends Fixture
{   
    private $verbs;
    
    public function __construct(ParameterBagInterface $params)
    {
        $this->verbs = $params->get('verbs')['all'];
    }

    public function load(ObjectManager $manager)
    {   
        $client = new GuzzleClient();

        foreach( $this->verbs as $verb ) {
            
            $res = $client->get( 'https://jisho.org/api/v1/search/words?keyword=' . urlencode( $verb ) );
            $data = json_decode( $res->getBody()->getContents(), true )['data'];
            if( !isset($data[0]) ) throw new \Exception('Verb not found');

            $manager->persist(new Verb($data[0]));

        }

        $manager->flush();
    }
}
