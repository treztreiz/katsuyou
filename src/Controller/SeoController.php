<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class SeoController extends AbstractController
{   
    /**
     * @Route("/robots.txt", name="seo.robots")
     */
    public function robots()
    {   
        $response = $this->renderView('seo/robots.txt.twig', [
            'sitemap' => $this->generateUrl( 'seo.sitemap', [], UrlGeneratorInterface::ABSOLUTE_URL )
        ]);
        $response = new Response( $response );
        $response->headers->set('Content-Type', 'text/txt');

        return $response;
    }

    /**
     * @Route("/sitemap.xml", name="seo.sitemap")
     */
    public function sitemap()
    {   
        $response = $this->renderView('seo/sitemap.xml.twig');
        $response = new Response( $response );
        $response->headers->set('Content-Type', 'text/xml');
            
        return $response;
    }

}