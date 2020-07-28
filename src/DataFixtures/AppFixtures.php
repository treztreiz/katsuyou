<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use App\Entity\Verb;
use GuzzleHttp\Client as GuzzleClient;

class AppFixtures extends Fixture
{   
    private $verbs = ["足す","答える","着く","浴びる","居る","出来る","生まれる","直る","負ける","違う","足りる","見つかる","喜ぶ","困る","無くなる","見える","込む","濡れる","始める","始まる","咲く","吹く","乗る","借りる","立てる","買う","呼ぶ","調べる","選ぶ","晴れる","登る","閉まる","来る","参る","続く","続ける","渡る","泣く","切る","決める","死ぬ","飲む","食べる","終わる","楽しむ","入る","取り換える","出す","倒れる","降る","下がる","見つける","釣る","忘れる","並ぶ","降りる","疲れる","起きる","あげる","返す","行く","進む","出る","出かける","回る","上がる","迎える","渡す","掛ける","有る","持つ","助ける","吸う","飛ぶ","知る","笑う","連れる","習う","貸す","並べる","聞く","住む","見る","下げる","間違える","騒ぐ","作る","会う","要る","知らせる","開ける","開く","塗る","別れる","過ぎる","払う","遊ぶ","刺す","磨く","褒める","引く","押す","入れる","履く","置く","読む","貰う","覚える","直す","頼む","休む","帰る","走る","言う","叱る","探す","売る","送る","見せる","閉める","歌う","座る","寝る","滑る","話す","立つ","盗む","張る","止まる","止める","泳ぐ","脱ぐ","掛かる","取る","教える","思う","投げる","捨てる","育てる","触る","消す","点ける","曲がる","分かる","使う","消える","待つ","歩く","洗う","着る","被る","働く","勤める","包む","書く","已める","勉強する","電話する","反対する","比較する","準備する","結婚する","キスする","ノックする","旅行する","散歩する","洗濯する","説明する","質問する","掃除する","約束する","予約する"];
    
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
