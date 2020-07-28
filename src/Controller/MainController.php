<?php

namespace App\Controller;

use App\Services\SettingsManager;
use App\Repository\VerbRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MainController extends AbstractController
{   
    private $verbRepository;

    public function __construct(VerbRepository $verbRepository)
    {
        $this->verbRepository = $verbRepository;
    }

    /**
     * @Route("/", name="main")
     */
    public function index()
    {   
        return $this->render('main/index.html.twig');
    }

    /**
     * @Route("/load", name="load", options={ "expose" : true })
     */
    public function load()
    {   
        // Verbs
        $verbs = [];
        foreach( $this->verbRepository->findAll() as $verb ) {
            $verbs[$verb->getId()] = $verb->getVerb(); 
        }

        // Tenses
        $tenses = $this->getParameter('tenses');

        // Settings
        $settings = new SettingsManager( $this->get('session') );

        return $this->json([
            'verbs' => $verbs,
            'tenses' => $tenses,
            'settings' => $settings->retrieve(),
        ]);
    }

    /**
     * @Route("/settings/update", name="settings.update", options={ "expose" : true })
     */
    public function update(Request $request)
    {   
        $settings = new SettingsManager( $this->get('session') );
        $param = $request->request->get('param');
        $value = $request->request->get('value');

        $settings = $settings->update($param, $value, $this->verbRepository, $this->getParameter('tenses'));

        return $settings ? $this->json($settings) : $this->json('Error', 500);
    }

}