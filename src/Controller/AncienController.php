<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use GuzzleHttp\Client as GuzzleClient;

class AncienController extends AbstractController
{   
    public function addVerbAncien(Request $request)
    {   
        $verb = null;
        $form = $this->createFormBuilder()->add('verb')->getForm();
        $form->handleRequest($request);
        
        if( $form->isSubmitted() && $form->isValid() ) {

            $client = new GuzzleClient();
            $res = $client->get( 'https://jisho.org/api/v1/search/words?keyword=' . urlencode( $form->get('verb')->getData() ) );
            $data = json_decode( $res->getBody()->getContents(), true )['data'];
            if( !isset($data[0]) ) throw new \Exception('Verb not found.');

            $verb = new Verb($data[0]);
            $em = $this->getDoctrine()->getManager();
            $em->persist($verb);
            $em->flush();

        }

        return $this->render('main/index.html.twig', [
            'form' => $form->createView(),
            'verb' => $verb
        ]);

    }
}
