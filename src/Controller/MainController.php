<?php

namespace App\Controller;

use App\Services\SettingsManager;
use App\Repository\VerbRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MainController extends AbstractController
{   
    private $settings;

    public function __construct(SettingsManager $settings)
    {
        $this->settings = $settings;
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
        return $this->json([
            'verbs' =>  $this->settings->getVerbs(),
            'tenses' => $this->settings->getTenses(),
            'settings' => $this->settings->retrieve(),
        ]);
    }

    /**
     * @Route("/settings/update", name="settings.update", options={ "expose" : true })
     */
    public function update(Request $request)
    {   
        $param = $request->request->get('param');
        $value = $request->request->get('value');

        $settings = $this->settings->update($param, $value);

        return $settings ? $this->json($settings) : $this->json('Error', 500);
    }

}